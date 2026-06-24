"use client";

import { useState, type ReactNode } from "react";

import { EditorScrollProvider, useEditorScrollRef } from "@/components/cms/editor/editor-scroll-context";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type BlockEditorWorkspaceProps = {
  editor: ReactNode;
  sidebar: ReactNode;
};

/**
 * CMS editor canvas + right inspector (dashboard shell provides header and left sidebar).
 */
export function BlockEditorWorkspace({ editor, sidebar }: BlockEditorWorkspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { scrollContainer, scrollRef } = useEditorScrollRef();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        <main
          ref={scrollRef}
          data-editor-scroll
          className="bg-muted/25 min-h-0 min-w-0 flex-1 overflow-y-auto"
        >
          <EditorScrollProvider container={scrollContainer}>{editor}</EditorScrollProvider>
        </main>

        <aside
          className={cn(
            "border-border bg-background flex w-full max-w-[400px] min-w-[320px] shrink-0 flex-col border-l",
            "max-md:absolute max-md:inset-y-(--header-height) max-md:right-0 max-md:z-20 max-md:shadow-xl",
            "max-md:transition-transform max-md:duration-200",
            !sidebarOpen && "max-md:translate-x-full",
            "md:flex",
            !sidebarOpen && "md:hidden",
          )}
        >
          <div className="border-border flex h-10 shrink-0 items-center justify-between border-b px-4">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Inspector
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hidden md:flex"
              onClick={() => setSidebarOpen(false)}
              aria-label="Hide inspector"
            >
              <PanelRightClose className="size-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
        </aside>

        {!sidebarOpen ? (
          <div className="border-border bg-background hidden shrink-0 border-l md:flex md:flex-col">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="m-2"
              onClick={() => setSidebarOpen(true)}
              aria-label="Show inspector"
            >
              <PanelRightOpen className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use BlockEditorWorkspace — dashboard shell provides the header. */
export const BlockEditorChrome = BlockEditorWorkspace;
