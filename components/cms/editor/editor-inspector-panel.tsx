"use client";

import type { ReactNode } from "react";

import { EditorBlockInspectorPanel } from "@/components/cms/editor/editor-block-inspector-panel";
import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";

type EditorInspectorPanelProps = {
  documentSettings?: ReactNode | null;
};

function EditorInspectorEmptyState() {
  return (
    <p className="text-muted-foreground px-2 text-sm">
      Select a block to edit its settings, or use the settings button in the header for post
      options.
    </p>
  );
}

/**
 * Right sidebar body: document settings by default, block inspector when a block is selected.
 */
export function EditorInspectorPanel({ documentSettings }: EditorInspectorPanelProps) {
  const { selectedBlock } = useEditorInspector();

  if (!selectedBlock) {
    if (documentSettings) {
      return documentSettings;
    }

    return <EditorInspectorEmptyState />;
  }

  return <EditorBlockInspectorPanel block={selectedBlock} />;
}
