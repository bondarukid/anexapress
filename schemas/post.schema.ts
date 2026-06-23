import { z } from "zod";

import { workspaceSlugRegex } from "@/schemas/workspace.schema";
import { seoFieldsSchema } from "@/schemas/seo.schema";
import { tiptapContentSchema } from "@/schemas/tiptap-content.schema";

export const postSlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(80, "Slug must be at most 80 characters")
  .regex(workspaceSlugRegex, "Slug may only contain lowercase letters, numbers, and hyphens");

export const createPostSchema = z.object({
  workspaceId: z.string().uuid(),
  siteId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  slug: postSlugSchema,
});

export const updatePostMetaSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  slug: postSlugSchema.optional(),
  ...seoFieldsSchema.shape,
});

export const saveDraftSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: tiptapContentSchema,
  seo: seoFieldsSchema.optional(),
});

export const publishPostSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export const createSnapshotSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export const revertVersionSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  versionId: z.string().uuid(),
});

export const deletePostSchema = z.object({
  postId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostMetaInput = z.infer<typeof updatePostMetaSchema>;
export type SaveDraftInput = z.infer<typeof saveDraftSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
