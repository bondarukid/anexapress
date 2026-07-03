import { z } from "zod";

/**
 * On-page post header fields (what readers see). Not used for SEO meta tags.
 */
export const postDisplayFieldsSchema = z.object({
  /** Subtitle under the post title on the public page — not meta description. */
  description: z.string().max(500).nullable().optional(),
  authorName: z.string().max(120).nullable().optional(),
  authorAvatarId: z.string().uuid().nullable().optional(),
});

export type PostDisplayFieldsInput = z.infer<typeof postDisplayFieldsSchema>;
