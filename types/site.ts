import type { FooterConfig, HeaderConfig, ThemeConfig } from "@/schemas/site-layout.schema";

export type Site = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  isDefault: boolean;
  primaryDomain: string | null;
  homePageId: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
  seoDefaultOgImageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SiteSummary = Pick<Site, "id" | "name" | "slug" | "isDefault" | "updatedAt">;

export type SiteDomain = {
  id: string;
  siteId: string;
  domain: string;
  isPrimary: boolean;
  createdAt: string;
};

export type ResolvedSiteByDomain = {
  workspaceSlug: string;
  workspaceId: string;
  siteSlug: string;
  siteId: string;
  primaryDomain: string | null;
};

export type SitePageType = "page" | "blog_index" | "system";

export type SitePageStatus = "draft" | "published" | "archived";

export type SitePage = {
  id: string;
  siteId: string;
  slug: string;
  type: SitePageType;
  title: string;
  status: SitePageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoKeywords: string[];
  ogImageId: string | null;
  currentDraftVersionId: string | null;
  publishedVersionId: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SitePageSummary = Pick<
  SitePage,
  "id" | "slug" | "type" | "title" | "status" | "updatedAt"
>;

export type SitePageVersion = {
  id: string;
  pageId: string;
  version: number;
  kind: "draft" | "snapshot" | "published";
  isCurrent: boolean;
  content: import("@/types/tiptap").TiptapContent;
  title: string;
  seoSnapshot: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
};

export type SitePageVersionSummary = Pick<
  SitePageVersion,
  "id" | "pageId" | "version" | "kind" | "createdAt" | "title"
>;

export type SiteLayout = {
  id: string;
  siteId: string;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  themeConfig: ThemeConfig;
  createdAt: string;
  updatedAt: string;
};

export type SiteWithLayout = Site & {
  layout: SiteLayout;
};

export type SitePageEditorData = {
  page: SitePage;
  draftVersion: SitePageVersion;
  site: SiteSummary;
  canPublish: boolean;
  canCreate: boolean;
};

export type PublishedSitePage = SitePage & {
  content: import("@/types/tiptap").TiptapContent;
  ogImageUrl: string | null;
};

export type SiteActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; code?: "not_found" | "forbidden" | "validation" };

export type ResolvedPublicSite = {
  workspaceSlug: string;
  workspaceId: string;
  workspaceName: string;
  workspaceLogoUrl: string | null;
  site: Site;
  layout: SiteLayout;
};
