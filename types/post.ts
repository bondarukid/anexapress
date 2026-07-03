import type { TiptapContent } from "@/types/tiptap";

export type PostStatus = "draft" | "published" | "archived";

export type PostVersionKind = "draft" | "snapshot" | "published";

export type PostSeoFields = {
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoKeywords: string[];
  ogImageId: string | null;
};

export type Post = {
  id: string;
  workspaceId: string;
  slug: string;
  /** On-page H1 in the post header — not `seoTitle`. */
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoKeywords: string[];
  ogImageId: string | null;
  /** On-page subtitle in the post header — not `seoDescription`. */
  description: string | null;
  authorName: string | null;
  authorAvatarId: string | null;
  usePostDescriptionForSeo: boolean;
  currentDraftVersionId: string | null;
  publishedVersionId: string | null;
  siteId: string | null;
  blogPageId: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostSummary = Pick<
  Post,
  "id" | "slug" | "title" | "status" | "publishedAt" | "updatedAt" | "createdAt"
> & {
  siteId?: string | null;
};

/** Published post row for public blog index cards. */
export type BlogPostListItem = PostSummary & {
  summary: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  coverImageUrl: string | null;
};

export type PostVersion = {
  id: string;
  postId: string;
  version: number;
  kind: PostVersionKind;
  isCurrent: boolean;
  content: TiptapContent;
  title: string;
  seoSnapshot: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
};

export type PostVersionSummary = Pick<
  PostVersion,
  "id" | "postId" | "version" | "kind" | "createdAt" | "title"
>;

export type PublishedPost = Post & {
  content: TiptapContent;
  ogImageUrl: string | null;
  authorAvatarUrl: string | null;
};

export type PostEditorData = {
  post: Post;
  draftVersion: PostVersion;
  canPublish: boolean;
  canCreate: boolean;
  authorAvatarUrl: string | null;
  /** True when draft content differs from the last published version. */
  hasUnpublishedChanges: boolean;
};

export type RevertedDraftData = {
  content: TiptapContent;
  title: string;
  seo: import("@/schemas/seo.schema").SeoFieldsInput;
  display: import("@/schemas/post-display.schema").PostDisplayFieldsInput;
  authorAvatarUrl: string | null;
};

export type PostActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; code?: "not_found" | "forbidden" | "validation" };
