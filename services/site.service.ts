import { createClient } from "@/lib/server";
import { mapSiteRow } from "@/lib/cms/site-mappers";
import { buildVerificationMetaTags } from "@/lib/cms/parse-verification-meta";
import { ENABLE_MULTI_SITE } from "@/lib/config/feature-flags";
import { resolveWorkspaceByIdForUser } from "@/lib/workspace-family/resolve";
import { PERM_CONTENT_CREATE } from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type { CreateSiteInput, UpdateSiteSettingsInput } from "@/schemas/site.schema";
import type { Site, SiteActionResult, SiteSummary } from "@/types/site";
import { DEFAULT_FOOTER_CONFIG, DEFAULT_HEADER_CONFIG } from "@/schemas/site-layout.schema";

const SITE_SELECT =
  "id, workspace_id, name, slug, is_default, primary_domain, home_page_id, seo_default_title, seo_default_description, seo_default_og_image_id, verification_meta_tags, created_at, updated_at";

export async function listSites(workspaceId: string): Promise<SiteSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, slug, is_default, updated_at")
    .eq("workspace_id", workspaceId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isDefault: row.is_default,
    updatedAt: row.updated_at,
  }));
}

export async function getSiteById(workspaceId: string, siteId: string): Promise<Site | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(SITE_SELECT)
    .eq("id", siteId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSiteRow(data);
}

type SiteWithWorkspaceAccess = {
  site: Site;
  workspace: NonNullable<Awaited<ReturnType<typeof resolveWorkspaceByIdForUser>>>;
};

/**
 * Loads a site by id when the user is a member of its workspace (RLS + membership check).
 */
export async function getSiteAccessibleToUser(
  userId: string,
  siteId: string,
): Promise<SiteWithWorkspaceAccess | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(SITE_SELECT)
    .eq("id", siteId)
    .maybeSingle();

  if (error || !data) return null;

  const workspace = await resolveWorkspaceByIdForUser(userId, data.workspace_id);
  if (!workspace) return null;

  return {
    site: mapSiteRow(data),
    workspace,
  };
}

export async function provisionDefaultSite(
  workspaceId: string,
  userId: string,
): Promise<SiteActionResult<{ siteId: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("provision_default_site", {
    p_workspace_id: workspaceId,
    p_user_id: userId,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: { siteId: data as string } };
}

export async function createSite(
  userId: string,
  input: CreateSiteInput,
): Promise<SiteActionResult<{ siteId: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  if (!ENABLE_MULTI_SITE) {
    const existingSites = await listSites(input.workspaceId);
    if (existingSites.length >= 1) {
      return {
        success: false,
        error: "Multiple sites are disabled. Use the default site for this workspace.",
        code: "validation",
      };
    }
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("sites")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("slug", input.slug)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "A site with this slug already exists.", code: "validation" };
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      workspace_id: input.workspaceId,
      name: input.name,
      slug: input.slug,
      is_default: false,
    })
    .select("id")
    .single();

  if (siteError || !site) {
    return { success: false, error: siteError?.message ?? "Failed to create site." };
  }

  await supabase.from("site_layouts").insert({
    site_id: site.id,
    header_config: {
      ...DEFAULT_HEADER_CONFIG,
      logo: { text: input.name },
      nav: input.withBlog ? [{ label: "Blog", pageSlug: "blog" }] : [],
    },
    footer_config: DEFAULT_FOOTER_CONFIG,
    theme_config: {},
  });

  let blogPageId: string | null = null;

  if (input.withBlog) {
    const { data: page, error: pageError } = await supabase
      .from("site_pages")
      .insert({
        site_id: site.id,
        slug: "blog",
        type: "blog_index",
        title: "Blog",
        status: "published",
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (pageError || !page) {
      return { success: false, error: pageError?.message ?? "Failed to create blog page." };
    }

    blogPageId = page.id;

    const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
    const { data: version, error: versionError } = await supabase
      .from("site_page_versions")
      .insert({
        page_id: page.id,
        version: 0,
        kind: "draft",
        is_current: true,
        content: emptyDoc,
        title: "Blog",
        seo_snapshot: {},
        created_by: userId,
      })
      .select("id")
      .single();

    if (versionError || !version) {
      return { success: false, error: versionError?.message ?? "Failed to create blog draft." };
    }

    await supabase
      .from("site_pages")
      .update({ current_draft_version_id: version.id })
      .eq("id", page.id);

    await supabase.from("sites").update({ home_page_id: page.id }).eq("id", site.id);
  }

  return { success: true, data: { siteId: site.id } };
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<SiteActionResult> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();
  const update: Record<string, unknown> = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.homePageId !== undefined) update.home_page_id = input.homePageId;
  if (input.seoDefaultTitle !== undefined) update.seo_default_title = input.seoDefaultTitle;
  if (input.seoDefaultDescription !== undefined) {
    update.seo_default_description = input.seoDefaultDescription;
  }

  if (input.verificationMetaTags !== undefined) {
    update.verification_meta_tags = input.verificationMetaTags;
  } else if (
    input.googleVerificationInput !== undefined ||
    input.bingVerificationInput !== undefined
  ) {
    const existingSite = await getSiteById(input.workspaceId, input.siteId);
    update.verification_meta_tags = buildVerificationMetaTags({
      googleInput: input.googleVerificationInput,
      bingInput: input.bingVerificationInput,
      existing: existingSite?.verificationMetaTags,
    });
  }

  if (Object.keys(update).length === 0) {
    return { success: true };
  }

  const { error } = await supabase
    .from("sites")
    .update(update)
    .eq("id", input.siteId)
    .eq("workspace_id", input.workspaceId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getDefaultSiteForWorkspace(workspaceId: string): Promise<Site | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select(SITE_SELECT)
    .eq("workspace_id", workspaceId)
    .eq("is_default", true)
    .maybeSingle();

  return data ? mapSiteRow(data) : null;
}

export async function getBlogPageForSite(siteId: string): Promise<{ id: string; slug: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("id, slug")
    .eq("site_id", siteId)
    .eq("type", "blog_index")
    .maybeSingle();

  return data ?? null;
}
