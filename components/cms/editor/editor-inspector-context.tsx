"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { CmsEditorInstance } from "@/types/cms-editor";

import type { EditorBlockSelection } from "@/lib/cms/editor-selection";

type EditorInspectorContextValue = {
  documentLabel: string;
  editor: CmsEditorInstance | null;
  selectedBlock: EditorBlockSelection | null;
  setEditor: (editor: CmsEditorInstance | null) => void;
  setSelectedBlock: Dispatch<SetStateAction<EditorBlockSelection | null>>;
  clearSelectedBlock: () => void;
};

const EditorInspectorContext = createContext<EditorInspectorContextValue | null>(null);

type EditorInspectorProviderProps = {
  children: ReactNode;
  documentLabel?: string;
};

/**
 * Tracks the block selected in Tiptap for the right inspector sidebar.
 */
export function EditorInspectorProvider({
  children,
  documentLabel = "Document",
}: EditorInspectorProviderProps) {
  const [selectedBlock, setSelectedBlock] = useState<EditorBlockSelection | null>(null);
  const [editor, setEditor] = useState<CmsEditorInstance | null>(null);

  const clearSelectedBlock = useCallback(() => {
    setSelectedBlock(null);
  }, []);

  const value = useMemo(
    () => ({
      documentLabel,
      editor,
      selectedBlock,
      setEditor,
      setSelectedBlock,
      clearSelectedBlock,
    }),
    [clearSelectedBlock, documentLabel, editor, selectedBlock],
  );

  return (
    <EditorInspectorContext.Provider value={value}>{children}</EditorInspectorContext.Provider>
  );
}

export function useEditorInspector(): EditorInspectorContextValue {
  const context = useContext(EditorInspectorContext);
  if (!context) {
    return {
      documentLabel: "Document",
      editor: null,
      selectedBlock: null,
      setEditor: () => undefined,
      setSelectedBlock: () => undefined,
      clearSelectedBlock: () => undefined,
    };
  }

  return context;
}
