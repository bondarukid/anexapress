"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Cloud,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Upload,
} from "lucide-react";

import { EditorScrollProvider, useEditorScrollRef } from "@/components/cms/editor/editor-scroll-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type BlockEditorChromeProps = {
  title: string;
  status: string;
  savedAt: string | null;
  isSaving: boolean;
  isPublishing: boolean;
  canPublish: boolean;
  onSaveVersion: () => void;
  onPublish: () => void;
  closeHref: string;
  editor: ReactNode;
  sidebar: ReactNode;
};

/**
 * Full-viewport CMS editor shell: toolbar + document canvas + inspector sidebar.
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
  closeHref,
  editor,
  sidebar,
}: BlockEditorChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { scrollContainer, scrollRef } = useEditorScrollRef();

  const statusLabel = status === "published" ? "Published" : "Draft";

  return (
    <div className="bg-background flex h-dvh flex-col overflow-hidden">
      <header className="border-border bg-background/95 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-3 backdrop-blur sm:px-4">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2" asChild>
          <Link href={closeHref}>
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </Button>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          <Badge variant={status === "published" ? "default" : "secondary"} className="shrink-0">
            {statusLabel}
          </Badge>
        </div>

        <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span className="hidden sm:inline">Saving…</span>
            </>
          ) : savedAt ? (
            <>
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">
                Saved {new Date(savedAt).toLocaleTimeString()}
              </span>
            </>
          ) : (
            <>
              <Cloud className="size-3.5" />
              <span className="hidden sm:inline">Autosave on</span>
            </>
          )}
        </div>

        <Separator orientation="vertical" className="hidden h-5 md:block" />

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden gap-1.5 sm:flex"
            onClick={onSaveVersion}
          >
            <Save className="size-3.5" />
            Save version
          </Button>

          {canPublish ? (
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={isPublishing}
              onClick={onPublish}
            >
              {isPublishing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {isPublishing ? "Publishing…" : "Publish"}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
          </Button>
        </div>
      </header>

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
            "max-md:absolute max-md:inset-y-14 max-md:right-0 max-md:z-20 max-md:shadow-xl",
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
              aria-label="Hide sidebar"
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
              aria-label="Show sidebar"
            >
              <PanelRightOpen className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
