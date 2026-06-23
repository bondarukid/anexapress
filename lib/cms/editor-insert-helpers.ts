import type { JSONContent } from "novel";

type EditorWithInsert = {
  chain: () => {
    focus: () => {
      insertContent: (
        content: JSONContent | JSONContent[],
      ) => {
        setTextSelection: (position: number) => { run: () => boolean };
        run: () => boolean;
      };
      setTextSelection: (position: number) => { run: () => boolean };
    };
  };
  state: {
    doc: {
      lastChild: { type: { name: string }; nodeSize: number } | null;
      content: { size: number };
    };
  };
  commands: {
    focus: (position: "end") => boolean;
  };
};

/**
 * Inserts a block-level atom node (image, YouTube, etc.) and an empty paragraph
 * after it, then places the text cursor in that paragraph.
 */
export function insertAtomBlockWithTrailingParagraph(
  editor: EditorWithInsert,
  block: JSONContent,
): void {
  const inserted = editor
    .chain()
    .focus()
    .insertContent([block, { type: "paragraph" }])
    .run();

  if (!inserted) return;

  const { doc } = editor.state;
  const lastChild = doc.lastChild;

  if (lastChild?.type.name === "paragraph") {
    const paragraphPos = doc.content.size - lastChild.nodeSize;
    editor.chain().focus().setTextSelection(paragraphPos + 1).run();
    return;
  }

  editor.commands.focus("end");
}
