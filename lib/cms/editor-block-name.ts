import type { CmsEditorInstance } from "@/types/cms-editor";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { selectBlockTextContent } from "@/lib/cms/editor-selection";

/**
 * Returns the plain text content used as the block name in the outline.
 */
export function getEditorBlockName(doc: ProseMirrorNode, blockPos: number): string {
  const node = doc.nodeAt(blockPos);
  if (!node) {
    return "";
  }

  return node.textContent;
}

/**
 * Replaces the selected block's text content with a new name.
 */
export function setEditorBlockName(
  editor: CmsEditorInstance,
  blockPos: number,
  name: string,
): void {
  const range = selectBlockTextContent(editor.state.doc, blockPos);
  if (!range) {
    return;
  }

  editor
    .chain()
    .focus()
    .setTextSelection(range)
    .deleteSelection()
    .insertContent(name)
    .run();
}
