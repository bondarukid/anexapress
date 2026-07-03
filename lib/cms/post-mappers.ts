import type { PostSeoFields } from "@/types/post";
import type { PostDisplayFieldsInput } from "@/schemas/post-display.schema";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

import type { PostRowDb } from "@/lib/cms/post-query";
import { parseSeoSnapshot } from "@/lib/cms/parse-seo-snapshot";

type PostRow = PostRowDb;

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
    description: row.description ?? null,
    authorName: row.author_name ?? null,
    authorAvatarId: row.author_avatar_id ?? null,
    usePostDescriptionForSeo: row.use_post_description_for_seo ?? false,
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

export function seoToSnapshot(
  seo: PostSeoFields & { usePostDescriptionForSeo?: boolean },
): Record<string, unknown> {
  return {
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    seoCanonical: seo.seoCanonical,
    seoKeywords: seo.seoKeywords,
    ogImageId: seo.ogImageId,
    usePostDescriptionForSeo: seo.usePostDescriptionForSeo ?? false,
  };
}

/**
 * SEO meta description only — never used for on-page post header text.
 */
export function resolveSeoMetaDescription(
  postDescription: string | null | undefined,
  seo: Pick<SeoFieldsInput, "seoDescription" | "usePostDescriptionForSeo">,
): string | null {
  if (seo.usePostDescriptionForSeo) {
    return postDescription?.trim() || null;
  }

  return seo.seoDescription?.trim() || null;
}

/**
 * SEO / Open Graph / browser tab title.
 * Falls back to the on-page post title when `seoTitle` is empty.
 */
export function resolveSeoTitle(
  postTitle: string,
  seo: Pick<SeoFieldsInput, "seoTitle">,
): string {
  return seo.seoTitle?.trim() || postTitle;
}

/** @deprecated Use resolveSeoMetaDescription */
export function resolveMetaDescription(
  description: string | null | undefined,
  seo: Pick<SeoFieldsInput, "seoDescription" | "usePostDescriptionForSeo">,
): string | null {
  return resolveSeoMetaDescription(description, seo);
}

export function displayToSnapshot(display?: PostDisplayFieldsInput): Record<string, unknown> {
  return {
    description: display?.description ?? null,
    authorName: display?.authorName ?? null,
    authorAvatarId: display?.authorAvatarId ?? null,
  };
}

export function parseDisplaySnapshot(snapshot: Record<string, unknown>): PostDisplayFieldsInput {
  return {
    description: (snapshot.description as string | null) ?? null,
    authorName: (snapshot.authorName as string | null) ?? null,
    authorAvatarId: (snapshot.authorAvatarId as string | null) ?? null,
  };
}

export type MappedPost = ReturnType<typeof mapPostRow>;

/**
 * Applies draft/published version snapshot onto post row fields (title, display, SEO).
 * Live `posts` columns are ignored when snapshot data exists.
 */
export function applyVersionSnapshotToPost(
  post: MappedPost,
  versionTitle: string,
  snapshot: Record<string, unknown>,
): MappedPost {
  const display = parseDisplaySnapshot(snapshot);
  const seo = parseSeoSnapshot(snapshot);

  return {
    ...post,
    title: versionTitle,
    description: display.description ?? null,
    authorName: display.authorName ?? null,
    authorAvatarId: display.authorAvatarId ?? null,
    seoTitle: seo.seoTitle ?? null,
    seoDescription: seo.seoDescription ?? null,
    seoCanonical: seo.seoCanonical ?? null,
    seoKeywords: seo.seoKeywords ?? [],
    ogImageId: seo.ogImageId ?? null,
    usePostDescriptionForSeo: seo.usePostDescriptionForSeo ?? false,
  };
}

/**
 * Draft slug stored in version snapshot (for published posts — applied on next publish).
 */
export function parseDraftSlugFromSnapshot(snapshot: Record<string, unknown>): string | null {
  const slug = snapshot.slug;
  return typeof slug === "string" && slug.length > 0 ? slug : null;
}

/**
 * Merges published version snapshot onto post row for the public site.
 * Live `posts` columns are ignored — readers only see the published version snapshot.
 */
export function applyPublishedVersionToPost(
  post: MappedPost,
  versionTitle: string,
  snapshot: Record<string, unknown>,
): MappedPost {
  return applyVersionSnapshotToPost(post, versionTitle, snapshot);
}

export type PostVersionCompareRow = {
  title: string;
  content: unknown;
  seo_snapshot: Record<string, unknown> | null;
};

function stableJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/**
 * Whether the working draft differs from the last published version.
 */
export function postDraftDiffersFromPublished(
  draft: PostVersionCompareRow,
  published: PostVersionCompareRow,
): boolean {
  if (draft.title !== published.title) return true;
  if (stableJson(draft.content) !== stableJson(published.content)) return true;
  if (stableJson(draft.seo_snapshot) !== stableJson(published.seo_snapshot)) return true;
  return false;
}

export function buildDraftSnapshot(
  seo: SeoFieldsInput,
  display?: PostDisplayFieldsInput,
  options?: { slug?: string | null },
): Record<string, unknown> {
  return {
    ...seoToSnapshot({
      seoTitle: seo.seoTitle ?? null,
      seoDescription: seo.seoDescription ?? null,
      seoCanonical: seo.seoCanonical ?? null,
      seoKeywords: seo.seoKeywords ?? [],
      ogImageId: seo.ogImageId ?? null,
      usePostDescriptionForSeo: seo.usePostDescriptionForSeo ?? false,
    }),
    ...displayToSnapshot(display),
    ...(options?.slug ? { slug: options.slug } : {}),
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
