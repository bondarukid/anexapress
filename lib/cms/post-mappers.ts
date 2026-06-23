import type { PostSeoFields } from "@/types/post";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

type PostRow = {
  id: string;
  workspace_id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_canonical: string | null;
  seo_keywords: string[] | null;
  og_image_id: string | null;
  current_draft_version_id: string | null;
  published_version_id: string | null;
  site_id: string | null;
  blog_page_id: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type PostVersionRow = {
  id: string;
  post_id: string;
  version: number;
  kind: string;
  is_current: boolean;
  content: unknown;
  title: string;
  seo_snapshot: Record<string, unknown> | null;
  created_at: string;
  created_by: string;
};

export function mapPostRow(row: PostRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    slug: row.slug,
    title: row.title,
    status: row.status as "draft" | "published" | "archived",
    publishedAt: row.published_at,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoCanonical: row.seo_canonical,
    seoKeywords: row.seo_keywords ?? [],
    ogImageId: row.og_image_id,
    currentDraftVersionId: row.current_draft_version_id,
    publishedVersionId: row.published_version_id,
    siteId: row.site_id ?? null,
    blogPageId: row.blog_page_id ?? null,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPostVersionRow(row: PostVersionRow) {
  return {
    id: row.id,
    postId: row.post_id,
    version: row.version,
    kind: row.kind as "draft" | "snapshot" | "published",
    isCurrent: row.is_current,
    content: row.content as import("@/types/tiptap").TiptapContent,
    title: row.title,
    seoSnapshot: row.seo_snapshot ?? {},
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function seoInputToDb(seo?: SeoFieldsInput): PostSeoFields {
  return {
    seoTitle: seo?.seoTitle ?? null,
    seoDescription: seo?.seoDescription ?? null,
    seoCanonical: seo?.seoCanonical ?? null,
    seoKeywords: seo?.seoKeywords ?? [],
    ogImageId: seo?.ogImageId ?? null,
  };
}

export function seoToSnapshot(seo: PostSeoFields): Record<string, unknown> {
  return {
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    seoCanonical: seo.seoCanonical,
    seoKeywords: seo.seoKeywords,
    ogImageId: seo.ogImageId,
  };
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
