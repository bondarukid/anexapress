import type { Site, SiteLayout, SitePage, SitePageVersion } from "@/types/site";
import type { HeaderConfig, FooterConfig, ThemeConfig } from "@/schemas/site-layout.schema";
import { DEFAULT_FOOTER_CONFIG, DEFAULT_HEADER_CONFIG } from "@/schemas/site-layout.schema";

type SiteRow = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  is_default: boolean;
  primary_domain: string | null;
  home_page_id: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  seo_default_og_image_id: string | null;
  created_at: string;
  updated_at: string;
};

type SitePageRow = {
  id: string;
  site_id: string;
  slug: string;
  type: string;
  title: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  seo_keywords: string[] | null;
  og_image_id: string | null;
  current_draft_version_id: string | null;
  published_version_id: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type SitePageVersionRow = {
  id: string;
  page_id: string;
  version: number;
  kind: string;
  is_current: boolean;
  content: unknown;
  title: string;
  seo_snapshot: Record<string, unknown> | null;
  created_at: string;
  created_by: string;
};

type SiteLayoutRow = {
  id: string;
  site_id: string;
  header_config: unknown;
  footer_config: unknown;
  theme_config: unknown;
  created_at: string;
  updated_at: string;
};

export function mapSiteRow(row: SiteRow): Site {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    slug: row.slug,
    isDefault: row.is_default,
    primaryDomain: row.primary_domain,
    homePageId: row.home_page_id,
    seoDefaultTitle: row.seo_default_title,
    seoDefaultDescription: row.seo_default_description,
    seoDefaultOgImageId: row.seo_default_og_image_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSitePageRow(row: SitePageRow): SitePage {
  return {
    id: row.id,
    siteId: row.site_id,
    slug: row.slug,
    type: row.type as SitePage["type"],
    title: row.title,
    status: row.status as SitePage["status"],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoCanonical: row.seo_canonical,
    seoKeywords: row.seo_keywords ?? [],
    ogImageId: row.og_image_id,
    currentDraftVersionId: row.current_draft_version_id,
    publishedVersionId: row.published_version_id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSitePageVersionRow(row: SitePageVersionRow): SitePageVersion {
  return {
    id: row.id,
    pageId: row.page_id,
    version: row.version,
    kind: row.kind as SitePageVersion["kind"],
    isCurrent: row.is_current,
    content: row.content as SitePageVersion["content"],
    title: row.title,
    seoSnapshot: row.seo_snapshot ?? {},
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function mapSiteLayoutRow(row: SiteLayoutRow): SiteLayout {
  return {
    id: row.id,
    siteId: row.site_id,
    headerConfig: (row.header_config as HeaderConfig) ?? DEFAULT_HEADER_CONFIG,
    footerConfig: (row.footer_config as FooterConfig) ?? DEFAULT_FOOTER_CONFIG,
    themeConfig: (row.theme_config as ThemeConfig) ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function resolvePageHref(basePath: string, pageSlug: string): string {
  if (pageSlug.startsWith("/")) {
    return pageSlug;
  }
  if (pageSlug === "" || pageSlug === "home") {
    return basePath || "/";
  }
  if (pageSlug === "blog") {
    return `${basePath}/blog`;
  }
  return `${basePath}/${pageSlug}`;
}
