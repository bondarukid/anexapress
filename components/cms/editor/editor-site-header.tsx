"use client";

import { useRouter } from "next/navigation";
import { Check, Cloud, LanguagesIcon, Loader2, Save, Upload } from "lucide-react";

import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import LanguageDropdown from "@/components/dashboard/dropdown-language";
import { NotificationButton } from "@/components/dashboard/notification-button";
import { useNotificationsContext } from "@/components/providers/notifications-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { workspacePath } from "@/lib/routing/workspace-paths";

/**
 * Dashboard-style header for CMS editor routes with save/publish actions.
 */
export function EditorSiteHeader() {
  const router = useRouter();
  const { chrome } = useEditorChrome();
  const { activeWorkspace, workspaces } = useWorkspace();
  const { unreadCount } = useNotificationsContext();

  const statusLabel = chrome.status === "published" ? "Published" : "Draft";

  function handleNotificationsClick() {
    const slug = activeWorkspace?.slug ?? workspaces[0]?.slug;
    if (!slug) return;
    router.push(workspacePath(slug, "/mail"));
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-base font-medium">{chrome.title}</h1>
          <Badge variant={chrome.status === "published" ? "default" : "secondary"} className="shrink-0">
            {statusLabel}
          </Badge>
        </div>

        <div className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
          {chrome.isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving…</span>
            </>
          ) : chrome.savedAt ? (
            <>
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Saved {new Date(chrome.savedAt).toLocaleTimeString()}</span>
            </>
          ) : (
            <>
              <Cloud className="size-3.5" />
              <span>Autosave on</span>
            </>
          )}
        </div>

        <Separator orientation="vertical" className="mx-1 hidden h-4 sm:block" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden gap-1.5 sm:flex"
            onClick={chrome.onSaveVersion}
          >
            <Save className="size-3.5" />
            Save version
          </Button>

          {chrome.canPublish ? (
            <Button
              type="button"
              size="sm"
              className="hidden gap-1.5 sm:flex"
              disabled={chrome.isPublishing}
              onClick={chrome.onPublish}
            >
              {chrome.isPublishing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {chrome.isPublishing ? "Publishing…" : "Publish"}
            </Button>
          ) : null}

          <LanguageDropdown
            trigger={
              <Button variant="ghost" size="icon-lg">
                <LanguagesIcon />
              </Button>
            }
          />

          <NotificationButton
            hasNotifications={unreadCount > 0}
            onClick={handleNotificationsClick}
          />
        </div>
      </div>
    </header>
  );
}
