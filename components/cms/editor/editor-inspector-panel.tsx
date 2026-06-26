"use client";

import type { ReactNode } from "react";

import { EditorBlockInspectorPanel } from "@/components/cms/editor/editor-block-inspector-panel";
import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";

type EditorInspectorPanelProps = {
  documentSettings: ReactNode;
};

/**
 * Right sidebar body: document settings by default, block inspector when a block is selected.
 */
export function EditorInspectorPanel({ documentSettings }: EditorInspectorPanelProps) {
  const { selectedBlock } = useEditorInspector();

  if (!selectedBlock) {
    return documentSettings;
  }

  return <EditorBlockInspectorPanel block={selectedBlock} />;
}
