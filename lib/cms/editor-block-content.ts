import type { CmsEditorInstance } from "@/types/cms-editor";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { selectBlockTextContent } from "@/lib/cms/editor-selection";

/**
 * Returns the editable text content inside a paragraph or heading block.
 */
export function getEditorBlockContent(doc: ProseMirrorNode, blockPos: number): string {
  const node = doc.nodeAt(blockPos);
  if (!node) {
    return "";
  }

  return node.textContent;
}

/**
 * Replaces inline text content inside a text block (not the block title).
 */
export function setEditorBlockContent(
  editor: CmsEditorInstance,
  blockPos: number,
  content: string,
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
    .insertContent(content)
    .run();
}
