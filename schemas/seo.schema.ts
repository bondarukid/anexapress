import { z } from "zod";

/**
 * Search / social metadata. Independent from on-page post title and description.
 */
export const seoFieldsSchema = z.object({
  /** Browser tab, Open Graph, search results — not the H1 on the post page. */
  seoTitle: z.string().max(120).nullable().optional(),
  /** Meta description for search and link previews — not the text under the post title. */
  seoDescription: z.string().max(320).nullable().optional(),
  seoCanonical: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  seoKeywords: z.array(z.string().max(50)).max(20).optional(),
  ogImageId: z.string().uuid().nullable().optional(),
  usePostDescriptionForSeo: z.boolean().optional(),
});

export type SeoFieldsInput = z.infer<typeof seoFieldsSchema>;
