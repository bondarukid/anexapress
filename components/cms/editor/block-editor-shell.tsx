"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Group, Panel, Separator } from "react-resizable-panels";

type BlockEditorChromeProps = {
  title: string;
  status: string;
  savedAt: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  canPublish: boolean;
  onSaveVersion: () => void;
  onPublish: () => void;
  editor: ReactNode;
  sidebar: ReactNode;
};

/**
 * Shared full-screen Novel editor chrome for posts and site pages.
 */
export function BlockEditorChrome({
  title,
  status,
  savedAt,
  isSaving,
  isPublishing,
  canPublish,
  onSaveVersion,
  onPublish,
  editor,
  sidebar,
}: BlockEditorChromeProps) {
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <header className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <span className="font-medium">{title}</span>
          <Badge variant={status === "published" ? "default" : "secondary"}>{status}</Badge>
          {isSaving ? (
            <span className="text-muted-foreground text-xs">Saving…</span>
          ) : savedAt ? (
            <span className="text-muted-foreground text-xs">
              Saved {new Date(savedAt).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onSaveVersion}>
            Save version
          </Button>
          {canPublish ? (
            <Button type="button" size="sm" disabled={isPublishing} onClick={onPublish}>
              {isPublishing ? "Publishing…" : "Publish"}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={() => window.close()}>
            Close
          </Button>
        </div>
      </header>

      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize={70} minSize={40}>
          <div className="h-full overflow-y-auto">{editor}</div>
        </Panel>
        <Separator className="bg-border w-px" />
        <Panel defaultSize={30} minSize={20} maxSize={45}>
          <div className="h-full overflow-y-auto p-4">{sidebar}</div>
        </Panel>
      </Group>
    </div>
  );
}
