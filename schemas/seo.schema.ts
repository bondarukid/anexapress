import { z } from "zod";

export const seoFieldsSchema = z.object({
  seoTitle: z.string().max(120).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  seoCanonical: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  seoKeywords: z.array(z.string().max(50)).max(20).optional(),
  ogImageId: z.string().uuid().nullable().optional(),
});

export type SeoFieldsInput = z.infer<typeof seoFieldsSchema>;
