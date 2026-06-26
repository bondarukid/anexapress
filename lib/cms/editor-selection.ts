import { NodeSelection, type Selection } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { getEditorBlockLabel } from "@/lib/cms/editor-block-tree";

export type EditorBlockSelection = {
  pos: number;
  type: string;
  label: string;
};

const TEXT_BLOCK_TYPES = new Set(["paragraph", "heading", "listItem", "taskItem"]);

/**
 * Returns true for blocks that support the rich text inspector panel.
 */
export function isTextBlockType(type: string): boolean {
  return TEXT_BLOCK_TYPES.has(type);
}

function buildBlockSelection(pos: number, node: ProseMirrorNode): EditorBlockSelection {
  return {
    pos,
    type: node.type.name,
    label: getEditorBlockLabel(node),
  };
}

function resolveTextBlockFromDepth(
  doc: ProseMirrorNode,
  anchor: number,
): EditorBlockSelection | null {
  const resolved = doc.resolve(anchor);

  for (let depth = resolved.depth; depth > 0; depth -= 1) {
    const node = resolved.node(depth);
    if (!isTextBlockType(node.type.name)) {
      continue;
    }

    return buildBlockSelection(resolved.before(depth), node);
  }

  return null;
}

/**
 * Resolves the currently selected editor block for the right inspector panel.
 * Empty text cursors return null so document-level settings stay visible.
 */
export function getEditorBlockSelection(
  doc: ProseMirrorNode,
  selection: Selection,
): EditorBlockSelection | null {
  if (selection instanceof NodeSelection) {
    const node = doc.nodeAt(selection.from);
    if (!node || node.isText) {
      return null;
    }

    return buildBlockSelection(selection.from, node);
  }

  if (selection.empty) {
    return null;
  }

  return resolveTextBlockFromDepth(doc, selection.from);
}

/**
 * Selects all inline content inside a block so mark commands apply to the whole block.
 */
export function selectBlockTextContent(
  doc: ProseMirrorNode,
  blockPos: number,
): { from: number; to: number } | null {
  const node = doc.nodeAt(blockPos);
  if (!node) return null;

  const from = blockPos + 1;
  const to = blockPos + node.nodeSize - 1;

  if (to < from) {
    return { from, to: from };
  }

  return { from, to };
}
