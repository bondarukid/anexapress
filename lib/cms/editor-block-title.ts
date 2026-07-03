import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import type { CmsBlockVariant } from "@/lib/cms/editor-block-attributes";

/**
 * Resolves the default block title for a heading level.
 */
export function resolveHeadingBlockTitle(level: number): string {
  return `Heading ${level}`;
}

/**
 * Resolves the default block title for a paragraph variant.
 */
export function resolveParagraphBlockTitle(blockVariant?: string | null): string {
  switch (blockVariant as CmsBlockVariant | undefined) {
    case "lead":
      return "Lead";
    case "muted":
      return "Muted text";
    case "quote":
      return "Quote";
    case "callout":
      return "Callout";
    default:
      return "Text";
  }
}

/**
 * Default block title from node type and layout attrs (level, variant).
 */
export function resolveBlockTitle(
  nodeType: string,
  attrs: Record<string, unknown>,
): string {
  if (nodeType === "heading") {
    const level = typeof attrs.level === "number" ? attrs.level : 1;
    return resolveHeadingBlockTitle(level);
  }

  if (nodeType === "paragraph") {
    return resolveParagraphBlockTitle(
      typeof attrs.blockVariant === "string" ? attrs.blockVariant : null,
    );
  }

  return nodeType;
}

/**
 * Reads block title from a node (attrs or derived default).
 */
export function getBlockTitleFromNode(node: ProseMirrorNode): string {
  const stored = node.attrs.blockTitle;
  if (typeof stored === "string" && stored.trim().length > 0) {
    return stored.trim();
  }

  return resolveBlockTitle(node.type.name, node.attrs);
}

/**
 * Reads the stored block title attribute, falling back to the type default.
 */
export function getEditorBlockTitle(doc: ProseMirrorNode, blockPos: number): string {
  const node = doc.nodeAt(blockPos);
  if (!node) {
    return "";
  }

  return getBlockTitleFromNode(node);
}
