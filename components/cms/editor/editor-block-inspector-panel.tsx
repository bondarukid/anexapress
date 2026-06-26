"use client";

import { TextBlockInspectorPanel } from "@/components/cms/editor/inspector/text-block-inspector-panel";
import { isTextBlockType, type EditorBlockSelection } from "@/lib/cms/editor-selection";

type EditorBlockInspectorPanelProps = {
  block: EditorBlockSelection;
};

/**
 * Block-level inspector shown when a top-level node is selected in the editor.
 */
export function EditorBlockInspectorPanel({ block }: EditorBlockInspectorPanelProps) {
  if (isTextBlockType(block.type)) {
    return <TextBlockInspectorPanel block={block} />;
  }

  return (
    <div className="space-y-4 px-1 py-1 pb-4">
      <div className="border-border bg-muted/20 space-y-1 rounded-lg border p-3">
        <p className="text-muted-foreground text-xs font-medium uppercase">Block type</p>
        <p className="text-sm">{block.label}</p>
      </div>

      <p className="text-muted-foreground text-xs">
        Settings for this block type are not available yet.
      </p>
    </div>
  );
}
