import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { getBlockTitleFromNode } from "@/lib/cms/editor-block-title";

export type EditorBlockTreeItem = {
  id: string;
  pos: number;
  nodeSize: number;
  type: string;
  label: string;
  depth: number;
  children: EditorBlockTreeItem[];
};

const ATOM_BLOCK_TYPES = new Set(["image", "youtube", "horizontalRule"]);

/** Blocks shown as a single outline row (no nested children). */
const FLAT_OUTLINE_BLOCK_TYPES = new Set([
  "heading",
  "paragraph",
  "codeBlock",
  "blockquote",
]);

export function getEditorBlockLabel(node: ProseMirrorNode): string {
  switch (node.type.name) {
    case "heading":
    case "paragraph":
      return getBlockTitleFromNode(node);
    case "bulletList":
      return "Bullet list";
    case "orderedList":
      return "Numbered list";
    case "taskList":
      return "To-do list";
    case "listItem":
    case "taskItem": {
      const text = node.textContent.trim();
      return text.length > 0 ? text.slice(0, 40) : "List item";
    }
    case "blockquote":
      return "Quote";
    case "codeBlock":
      return "Code block";
    case "image":
      return "Image";
    case "youtube":
      return "YouTube";
    case "horizontalRule":
      return "Divider";
    default:
      return node.type.name;
  }
}

function shouldSkipEmptyParagraph(
  node: ProseMirrorNode,
  parent: ProseMirrorNode | null,
  indexInParent: number,
): boolean {
  if (node.type.name !== "paragraph" || node.content.size > 0) {
    return false;
  }

  if (!parent) return true;

  const previous = indexInParent > 0 ? parent.child(indexInParent - 1) : null;
  return previous !== null && ATOM_BLOCK_TYPES.has(previous.type.name);
}

function walkNode(
  node: ProseMirrorNode,
  pos: number,
  depth: number,
  parent: ProseMirrorNode | null,
  indexInParent: number,
): EditorBlockTreeItem | null {
  if (node.isText) {
    return null;
  }

  if (shouldSkipEmptyParagraph(node, parent, indexInParent)) {
    return null;
  }

  const item: EditorBlockTreeItem = {
    id: `${pos}`,
    pos,
    nodeSize: node.nodeSize,
    type: node.type.name,
    label: getEditorBlockLabel(node),
    depth,
    children: [],
  };

  if (node.childCount === 0 || FLAT_OUTLINE_BLOCK_TYPES.has(node.type.name)) {
    return item;
  }

  let childPos = pos + 1;
  for (let index = 0; index < node.childCount; index += 1) {
    const child = node.child(index);
    const childItem = walkNode(child, childPos, depth + 1, node, index);
    if (childItem) {
      item.children.push(childItem);
    }
    childPos += child.nodeSize;
  }

  return item;
}

/**
 * Builds a hierarchical block tree from a ProseMirror document for the outline sidebar.
 */
export function buildEditorBlockTree(doc: ProseMirrorNode): EditorBlockTreeItem[] {
  const items: EditorBlockTreeItem[] = [];
  let pos = 0;

  for (let index = 0; index < doc.childCount; index += 1) {
    const child = doc.child(index);
    const item = walkNode(child, pos, 0, doc, index);
    if (item) {
      items.push(item);
    }
    pos += child.nodeSize;
  }

  return items;
}

/**
 * Returns top-level document blocks only (for sortable reorder MVP).
 */
export function getTopLevelEditorBlocks(doc: ProseMirrorNode): EditorBlockTreeItem[] {
  return buildEditorBlockTree(doc);
}

/**
 * Finds the active top-level block position for the current selection anchor.
 */
export function getActiveTopLevelBlockPos(doc: ProseMirrorNode, anchor: number): number | null {
  if (doc.childCount === 0) return null;

  const resolved = doc.resolve(anchor);

  // NodeSelection on the first top-level block uses anchor 0, which resolves at doc depth.
  // `before(0)` is invalid — use the gap position instead.
  if (resolved.depth === 0) {
    if (resolved.pos >= doc.content.size) {
      let pos = 0;
      for (let index = 0; index < doc.childCount - 1; index += 1) {
        pos += doc.child(index).nodeSize;
      }
      return pos;
    }

    return resolved.pos;
  }

  return resolved.before(1);
}
