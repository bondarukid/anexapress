import type { TiptapContent, TiptapNode } from "@/types/tiptap";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Walks Tiptap JSON and returns the first image block `src`.
 */
export function findFirstImageSrcInTiptapContent(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;

  const doc = content as TiptapContent;
  if (doc.type !== "doc" || !Array.isArray(doc.content)) return null;

  const queue: TiptapNode[] = [...doc.content];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;

    if (node.type === "image") {
      const src = node.attrs?.src;
      if (isNonEmptyString(src)) return src.trim();
    }

    if (node.content?.length) {
      queue.push(...node.content);
    }
  }

  return null;
}

type ResolvePostCoverImageUrlInput = {
  content: unknown;
  /** Reserved for a future post-settings cover override (e.g. dedicated cover media). */
  explicitCoverImageUrl?: string | null;
};

/**
 * Resolves the blog card / list cover image for a post.
 * Today: first image block in content. Later: `explicitCoverImageUrl` from post settings.
 */
export function resolvePostCoverImageUrl({
  content,
  explicitCoverImageUrl,
}: ResolvePostCoverImageUrlInput): string | null {
  if (explicitCoverImageUrl?.trim()) {
    return explicitCoverImageUrl.trim();
  }

  return findFirstImageSrcInTiptapContent(content);
}
