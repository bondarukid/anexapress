import { NodeSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

type EditorLike = {
  state: EditorView["state"];
  view: EditorView;
  chain: () => {
    focus: () => {
      setNodeSelection: (pos: number) => {
        scrollIntoView: () => { run: () => boolean };
      };
    };
  };
};

/**
 * Moves a top-level block from one index to another in the ProseMirror document.
 */
export function moveTopLevelEditorBlock(
  editor: EditorLike,
  fromIndex: number,
  toIndex: number,
): boolean {
  const { doc } = editor.state;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= doc.childCount || toIndex >= doc.childCount) {
    return false;
  }

  if (fromIndex === toIndex) {
    return true;
  }

  let fromPos = 0;
  for (let index = 0; index < fromIndex; index += 1) {
    fromPos += doc.child(index).nodeSize;
  }

  const node = doc.child(fromIndex);
  const fromEnd = fromPos + node.nodeSize;

  let tr = editor.state.tr.delete(fromPos, fromEnd);
  const newDoc = tr.doc;

  let insertPos = 0;
  if (toIndex >= newDoc.childCount) {
    insertPos = newDoc.content.size;
  } else {
    for (let index = 0; index < toIndex; index += 1) {
      insertPos += newDoc.child(index).nodeSize;
    }
  }

  tr = tr.insert(insertPos, node);
  tr = tr.setSelection(NodeSelection.create(tr.doc, insertPos));
  editor.view.dispatch(tr.scrollIntoView());
  return true;
}

/**
 * Deletes the block at the given document position.
 */
export function deleteEditorBlockAtPos(editor: EditorLike, pos: number): boolean {
  const { doc } = editor.state;
  if (!doc.nodeAt(pos)) {
    return false;
  }

  const tr = editor.state.tr.setSelection(NodeSelection.create(doc, pos)).deleteSelection();
  editor.view.dispatch(tr.scrollIntoView());
  return true;
}

/**
 * Inserts a copy of the block at the given position immediately after it.
 */
export function duplicateEditorBlockAtPos(editor: EditorLike, pos: number): boolean {
  const { doc } = editor.state;
  const node = doc.nodeAt(pos);
  if (!node) {
    return false;
  }

  const insertPos = pos + node.nodeSize;
  const tr = editor.state.tr.insert(insertPos, node.copy(node.content));
  tr.setSelection(NodeSelection.create(tr.doc, insertPos));
  editor.view.dispatch(tr.scrollIntoView());
  return true;
}

/**
 * Selects a block at the given document position and scrolls it into view.
 */
export function selectEditorBlockAtPos(editor: EditorLike, pos: number): void {
  const { doc } = editor.state;
  const node = doc.nodeAt(pos);
  if (!node) return;

  editor.chain().focus().setNodeSelection(pos).scrollIntoView().run();
}
