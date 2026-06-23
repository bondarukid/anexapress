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
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoKeywords: string[];
  ogImageId: string | null;
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
};

export type PostEditorData = {
  post: Post;
  draftVersion: PostVersion;
  canPublish: boolean;
  canCreate: boolean;
};

export type RevertedDraftData = {
  content: TiptapContent;
  title: string;
  seo: import("@/schemas/seo.schema").SeoFieldsInput;
};

export type PostActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; code?: "not_found" | "forbidden" | "validation" };
