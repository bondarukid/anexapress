"use client";

import type { CSSProperties, ReactNode } from "react";

import { EditorInspectorPanel } from "@/components/cms/editor/editor-inspector-panel";
import { EditorInspectorProvider } from "@/components/cms/editor/editor-inspector-context";
import { EditorInspectorSidebar } from "@/components/cms/editor/editor-inspector-sidebar";
import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import { EditorScrollProvider, useEditorScrollRef } from "@/components/cms/editor/editor-scroll-context";
import { SidebarProvider } from "@/components/ui/sidebar";

type BlockEditorWorkspaceProps = {
  editor: ReactNode;
  documentSettings: ReactNode;
  documentLabel?: string;
};

/**
 * CMS editor canvas + right inspector (dashboard shell provides header and left sidebar).
 */
export function BlockEditorWorkspace({
  editor,
  documentSettings,
  documentLabel = "Document",
}: BlockEditorWorkspaceProps) {
  const { inspectorOpen, setInspectorOpen } = useEditorChrome();
  const { scrollContainer, scrollRef } = useEditorScrollRef();

  return (
    <EditorInspectorProvider documentLabel={documentLabel}>
      <SidebarProvider
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        persistState={false}
        enableKeyboardShortcut={false}
        className="min-h-0 flex-1 overflow-hidden"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as CSSProperties
        }
      >
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <main
            ref={scrollRef}
            data-editor-scroll
            className="bg-muted/25 min-h-0 min-w-0 flex-1 overflow-y-auto"
          >
            <EditorScrollProvider container={scrollContainer}>{editor}</EditorScrollProvider>
          </main>

          <EditorInspectorSidebar>
            <EditorInspectorPanel documentSettings={documentSettings} />
          </EditorInspectorSidebar>
        </div>
      </SidebarProvider>
    </EditorInspectorProvider>
  );
}

/** @deprecated Use BlockEditorWorkspace — dashboard shell provides the header. */
export const BlockEditorChrome = BlockEditorWorkspace;
