import { createClient } from "@/lib/server";
import { buildSiteBasePath } from "@/lib/cms/site-paths";
import { lookupSiteByDomain, normalizeHostname } from "@/lib/cms/site-host";
import { mapSiteLayoutRow, mapSitePageRow, mapSiteRow } from "@/lib/cms/site-mappers";
import type { ResolvedPublicSite, ResolvedSiteByDomain, Site, SitePage } from "@/types/site";

export async function getSiteBySlug(
  workspaceSlug: string,
  siteSlug: string,
): Promise<ResolvedPublicSite | null> {
  const supabase = await createClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, logo_url")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return null;

  const { data: siteRow } = await supabase
    .from("sites")
    .select(
      "id, workspace_id, name, slug, is_default, primary_domain, home_page_id, seo_default_title, seo_default_description, seo_default_og_image_id, created_at, updated_at",
    )
    .eq("workspace_id", workspace.id)
    .eq("slug", siteSlug)
    .maybeSingle();

  if (!siteRow) return null;

  const { data: layoutRow } = await supabase
    .from("site_layouts")
    .select("*")
    .eq("site_id", siteRow.id)
    .maybeSingle();

  if (!layoutRow) return null;

  return {
    workspaceSlug: workspace.slug,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceLogoUrl: workspace.logo_url,
    site: mapSiteRow(siteRow),
    layout: mapSiteLayoutRow(layoutRow),
  };
}

export async function getDefaultSiteSlug(workspaceSlug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (!workspace) return null;

  const { data: site } = await supabase
    .from("sites")
    .select("slug")
    .eq("workspace_id", workspace.id)
    .eq("is_default", true)
    .maybeSingle();

  return site?.slug ?? null;
}

export async function getSiteHomePage(site: Site): Promise<SitePage | null> {
  if (!site.homePageId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("*")
    .eq("id", site.homePageId)
    .maybeSingle();

  return data ? mapSitePageRow(data) : null;
}

export async function getSiteByDomain(hostname: string): Promise<ResolvedSiteByDomain | null> {
  const supabase = await createClient();
  return lookupSiteByDomain(supabase, normalizeHostname(hostname));
}

export { buildSiteBasePath };
