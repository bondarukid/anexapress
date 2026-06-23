import { createClient } from "@/lib/server";
import {
  mapSitePageRow,
  mapSitePageVersionRow,
} from "@/lib/cms/site-mappers";
import { seoInputToDb, seoToSnapshot } from "@/lib/cms/post-mappers";
import { syncSitePageBlocks } from "@/lib/cms/sync-site-page-blocks";
import { parseSeoSnapshot } from "@/lib/cms/parse-seo-snapshot";
import {
  PERM_CONTENT_CREATE,
  PERM_CONTENT_PUBLISH,
} from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type {
  CreateSitePageInput,
  SaveSitePageDraftInput,
} from "@/schemas/site.schema";
import type {
  PublishedSitePage,
  RevertedDraftData,
  SiteActionResult,
  SitePageEditorData,
  SitePageSummary,
  SitePageVersionSummary,
} from "@/types/site";
import type { TiptapContent } from "@/types/tiptap";

const PAGE_SELECT =
  "id, site_id, slug, type, title, status, seo_title, seo_description, seo_canonical, seo_keywords, og_image_id, current_draft_version_id, published_version_id, created_by, updated_by, created_at, updated_at";

async function assertSiteInWorkspace(siteId: string, workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return Boolean(data);
}

export async function listSitePages(siteId: string): Promise<SitePageSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_pages")
    .select("id, slug, type, title, status, updated_at")
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    type: row.type as SitePageSummary["type"],
    title: row.title,
    status: row.status as SitePageSummary["status"],
    updatedAt: row.updated_at,
  }));
}

export async function createSitePage(
  userId: string,
  input: CreateSitePageInput,
): Promise<SiteActionResult<{ pageId: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const inWorkspace = await assertSiteInWorkspace(input.siteId, input.workspaceId);
  if (!inWorkspace) return { success: false, error: "Site not found.", code: "not_found" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_pages")
    .select("id")
    .eq("site_id", input.siteId)
    .eq("slug", input.slug)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "A page with this slug already exists.", code: "validation" };
  }

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .insert({
      site_id: input.siteId,
      slug: input.slug,
      type: input.type,
      title: input.title,
      status: "draft",
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (pageError || !page) {
    return { success: false, error: pageError?.message ?? "Failed to create page." };
  }

  const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
  const { data: version, error: versionError } = await supabase
    .from("site_page_versions")
    .insert({
      page_id: page.id,
      version: 0,
      kind: "draft",
      is_current: true,
      content: emptyDoc,
      title: input.title,
      seo_snapshot: {},
      created_by: userId,
    })
    .select("id")
    .single();

  if (versionError || !version) {
    return { success: false, error: versionError?.message ?? "Failed to create draft." };
  }

  await supabase
    .from("site_pages")
    .update({ current_draft_version_id: version.id })
    .eq("id", page.id);

  return { success: true, data: { pageId: page.id } };
}

export async function getSitePageEditorData(
  workspaceId: string,
  siteId: string,
  pageId: string,
): Promise<SitePageEditorData | null> {
  const inWorkspace = await assertSiteInWorkspace(siteId, workspaceId);
  if (!inWorkspace) return null;

  const supabase = await createClient();

  const [pageRes, siteRes, createPerm, publishPerm] = await Promise.all([
    supabase.from("site_pages").select(PAGE_SELECT).eq("id", pageId).eq("site_id", siteId).maybeSingle(),
    supabase.from("sites").select("id, name, slug, is_default, updated_at").eq("id", siteId).maybeSingle(),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_CREATE,
    }),
    supabase.rpc("has_effective_workspace_permission", {
      ws_id: workspaceId,
      perm_key: PERM_CONTENT_PUBLISH,
    }),
  ]);

  if (pageRes.error || !pageRes.data || !siteRes.data) return null;

  const page = mapSitePageRow(pageRes.data);
  if (!page.currentDraftVersionId) return null;

  const { data: versionRow } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("id", page.currentDraftVersionId)
    .maybeSingle();

  if (!versionRow) return null;

  return {
    page,
    draftVersion: mapSitePageVersionRow(versionRow),
    site: {
      id: siteRes.data.id,
      name: siteRes.data.name,
      slug: siteRes.data.slug,
      isDefault: siteRes.data.is_default,
      updatedAt: siteRes.data.updated_at,
    },
    canCreate: createPerm.data === true,
    canPublish: publishPerm.data === true,
  };
}

export async function saveSitePageDraft(
  userId: string,
  input: SaveSitePageDraftInput,
): Promise<SiteActionResult<{ savedAt: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const inWorkspace = await assertSiteInWorkspace(input.siteId, input.workspaceId);
  if (!inWorkspace) return { success: false, error: "Site not found.", code: "not_found" };

  const supabase = await createClient();
  const seo = seoInputToDb(input.seo);

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select("id, current_draft_version_id, title")
    .eq("id", input.pageId)
    .eq("site_id", input.siteId)
    .maybeSingle();

  if (pageError || !page?.current_draft_version_id) {
    return { success: false, error: "Page not found.", code: "not_found" };
  }

  const title = input.title ?? page.title;
  const seoSnapshot = seoToSnapshot(seo);

  const { error: versionError } = await supabase
    .from("site_page_versions")
    .update({
      content: input.content,
      title,
      seo_snapshot: seoSnapshot,
      is_current: true,
    })
    .eq("id", page.current_draft_version_id);

  if (versionError) return { success: false, error: versionError.message };

  const pageUpdate: Record<string, unknown> = {
    updated_by: userId,
    seo_title: seo.seoTitle,
    seo_description: seo.seoDescription,
    seo_canonical: seo.seoCanonical,
    seo_keywords: seo.seoKeywords,
    og_image_id: seo.ogImageId,
  };
  if (input.title) pageUpdate.title = input.title;

  await supabase.from("site_pages").update(pageUpdate).eq("id", input.pageId);

  await syncSitePageBlocks(input.pageId, page.current_draft_version_id, input.content as TiptapContent);

  return { success: true, data: { savedAt: new Date().toISOString() } };
}

export async function publishSitePage(
  userId: string,
  workspaceId: string,
  siteId: string,
  pageId: string,
): Promise<SiteActionResult> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_PUBLISH);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .eq("site_id", siteId)
    .maybeSingle();

  if (pageError || !page?.current_draft_version_id) {
    return { success: false, error: "Page not found.", code: "not_found" };
  }

  const { data: draft } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("id", page.current_draft_version_id)
    .single();

  if (!draft) return { success: false, error: "Draft not found." };

  const { data: maxPublished } = await supabase
    .from("site_page_versions")
    .select("version")
    .eq("page_id", pageId)
    .eq("kind", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxPublished?.version ?? 0) + 1;

  const { data: publishedVersion, error: publishError } = await supabase
    .from("site_page_versions")
    .insert({
      page_id: pageId,
      version: nextVersion,
      kind: "published",
      is_current: false,
      content: draft.content,
      title: draft.title,
      seo_snapshot: draft.seo_snapshot,
      created_by: userId,
    })
    .select("id")
    .single();

  if (publishError || !publishedVersion) {
    return { success: false, error: publishError?.message ?? "Publish failed." };
  }

  await supabase
    .from("site_pages")
    .update({
      status: "published",
      published_version_id: publishedVersion.id,
      updated_by: userId,
    })
    .eq("id", pageId);

  await syncSitePageBlocks(pageId, publishedVersion.id, draft.content as TiptapContent);

  return { success: true };
}

export async function createSitePageSnapshot(
  userId: string,
  workspaceId: string,
  siteId: string,
  pageId: string,
): Promise<SiteActionResult<{ versionId: string }>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("id, current_draft_version_id")
    .eq("id", pageId)
    .eq("site_id", siteId)
    .maybeSingle();

  if (!page?.current_draft_version_id) {
    return { success: false, error: "Page not found.", code: "not_found" };
  }

  const { data: draft } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("id", page.current_draft_version_id)
    .single();

  if (!draft) return { success: false, error: "Draft not found." };

  const { data: maxVersion } = await supabase
    .from("site_page_versions")
    .select("version")
    .eq("page_id", pageId)
    .eq("kind", "snapshot")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxVersion?.version ?? 0) + 1;

  const { data: snapshot, error } = await supabase
    .from("site_page_versions")
    .insert({
      page_id: pageId,
      version: nextVersion,
      kind: "snapshot",
      is_current: false,
      content: draft.content,
      title: draft.title,
      seo_snapshot: draft.seo_snapshot,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !snapshot) return { success: false, error: error?.message ?? "Snapshot failed." };

  await syncSitePageBlocks(pageId, snapshot.id, draft.content as TiptapContent);
  return { success: true, data: { versionId: snapshot.id } };
}

export async function revertSitePageVersion(
  userId: string,
  workspaceId: string,
  siteId: string,
  pageId: string,
  versionId: string,
): Promise<SiteActionResult<RevertedDraftData>> {
  const guard = await requireWorkspacePermission(workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("id, current_draft_version_id")
    .eq("id", pageId)
    .eq("site_id", siteId)
    .maybeSingle();

  if (!page?.current_draft_version_id) {
    return { success: false, error: "Page not found.", code: "not_found" };
  }

  const { data: source } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .maybeSingle();

  if (!source) return { success: false, error: "Version not found.", code: "not_found" };

  await supabase
    .from("site_page_versions")
    .update({
      content: source.content,
      title: source.title,
      seo_snapshot: source.seo_snapshot,
    })
    .eq("id", page.current_draft_version_id);

  const snapshot = (source.seo_snapshot ?? {}) as Record<string, unknown>;
  await supabase
    .from("site_pages")
    .update({
      title: source.title,
      seo_title: (snapshot.seoTitle as string | null) ?? null,
      seo_description: (snapshot.seoDescription as string | null) ?? null,
      seo_canonical: (snapshot.seoCanonical as string | null) ?? null,
      seo_keywords: (snapshot.seoKeywords as string[]) ?? [],
      og_image_id: (snapshot.ogImageId as string | null) ?? null,
      updated_by: userId,
    })
    .eq("id", pageId);

  await syncSitePageBlocks(pageId, page.current_draft_version_id, source.content as TiptapContent);

  return {
    success: true,
    data: {
      content: source.content as TiptapContent,
      title: source.title,
      seo: parseSeoSnapshot(snapshot),
    },
  };
}

export async function listSitePageVersions(
  siteId: string,
  pageId: string,
): Promise<SitePageVersionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_page_versions")
    .select("id, page_id, version, kind, created_at, title")
    .eq("page_id", pageId)
    .in("kind", ["snapshot", "published"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    pageId: row.page_id,
    version: row.version,
    kind: row.kind as SitePageVersionSummary["kind"],
    createdAt: row.created_at,
    title: row.title,
  }));
}

export async function getPublishedSitePage(
  siteId: string,
  pageSlug: string,
): Promise<PublishedSitePage | null> {
  const supabase = await createClient();

  const { data: pageRow } = await supabase
    .from("site_pages")
    .select(`${PAGE_SELECT}, media_files:og_image_id ( public_url )`)
    .eq("site_id", siteId)
    .eq("slug", pageSlug)
    .eq("status", "published")
    .maybeSingle();

  if (!pageRow?.published_version_id) return null;

  const { data: versionRow } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("id", pageRow.published_version_id)
    .maybeSingle();

  if (!versionRow) return null;

  const page = mapSitePageRow(pageRow);
  const ogJoin = pageRow.media_files as { public_url: string } | { public_url: string }[] | null;
  const ogImageUrl = Array.isArray(ogJoin) ? (ogJoin[0]?.public_url ?? null) : (ogJoin?.public_url ?? null);

  return {
    ...page,
    content: versionRow.content as TiptapContent,
    ogImageUrl,
  };
}

export async function getSitePageById(siteId: string, pageId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .eq("site_id", siteId)
    .maybeSingle();

  return data ? mapSitePageRow(data) : null;
}
