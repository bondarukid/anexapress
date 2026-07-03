"use client";

import { useEffect } from "react";
import { useEditor } from "novel";

import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";
import { getEditorBlockLabel } from "@/lib/cms/editor-block-tree";
import {
  resolveStickyEditorBlockSelection,
} from "@/lib/cms/editor-selection";

/**
 * Syncs Tiptap selection and editor instance into the inspector context.
 */
export function EditorSelectionBridge() {
  const { editor } = useEditor();
  const { setEditor, setSelectedBlock } = useEditorInspector();

  useEffect(() => {
    setEditor(editor ?? null);
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);

  useEffect(() => {
    if (!editor) return undefined;

    const syncSelection = () => {
      setSelectedBlock((current) =>
        resolveStickyEditorBlockSelection(
          editor.state.doc,
          editor.state.selection,
          current,
        ),
      );
    };

    const syncBlockLabel = () => {
      setSelectedBlock((current) => {
        if (!current) {
          return null;
        }

        const node = editor.state.doc.nodeAt(current.pos);
        if (!node) {
          return null;
        }

        return {
          pos: current.pos,
          type: node.type.name,
          label: getEditorBlockLabel(node),
        };
      });
    };

    syncSelection();
    editor.on("selectionUpdate", syncSelection);
    editor.on("transaction", syncBlockLabel);

    return () => {
      editor.off("selectionUpdate", syncSelection);
      editor.off("transaction", syncBlockLabel);
    };
  }, [editor, setSelectedBlock]);

  return null;
}
