import { z } from "zod";

const tiptapMarkSchema: z.ZodType<{
  type: string;
  attrs?: Record<string, unknown>;
}> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
  }),
);

const tiptapNodeSchema: z.ZodType<{
  type: string;
  attrs?: Record<string, unknown>;
  content?: unknown[];
  text?: string;
  marks?: unknown[];
}> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    text: z.string().optional(),
    marks: z.array(tiptapMarkSchema).optional(),
  }),
);

/** Sanity check for Novel/Tiptap JSON before persisting. */
export const tiptapContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(tiptapNodeSchema).optional(),
});

export type TiptapContentInput = z.infer<typeof tiptapContentSchema>;
