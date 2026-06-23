import { z } from "zod";

import { workspaceSlugRegex } from "@/schemas/workspace.schema";
import { seoFieldsSchema } from "@/schemas/seo.schema";
import { tiptapContentSchema } from "@/schemas/tiptap-content.schema";

export const siteSlugSchema = z
  .string()
  .min(2)
  .max(48)
  .regex(workspaceSlugRegex);

export const sitePageSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createSiteSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(80),
  slug: siteSlugSchema,
  withBlog: z.boolean().optional().default(true),
});

export const updateSiteSettingsSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(2).max(80).optional(),
  homePageId: z.string().uuid().nullable().optional(),
  seoDefaultTitle: z.string().max(120).nullable().optional(),
  seoDefaultDescription: z.string().max(320).nullable().optional(),
});

export const createSitePageSchema = z.object({
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: sitePageSlugSchema,
  type: z.enum(["page", "blog_index"]).default("page"),
});

export const saveSitePageDraftSchema = z.object({
  pageId: z.string().uuid(),
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: tiptapContentSchema,
  seo: seoFieldsSchema.optional(),
});

export const publishSitePageSchema = z.object({
  pageId: z.string().uuid(),
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export const createSitePageSnapshotSchema = z.object({
  pageId: z.string().uuid(),
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export const revertSitePageVersionSchema = z.object({
  pageId: z.string().uuid(),
  siteId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  versionId: z.string().uuid(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
export type CreateSitePageInput = z.infer<typeof createSitePageSchema>;
export type SaveSitePageDraftInput = z.infer<typeof saveSitePageDraftSchema>;
