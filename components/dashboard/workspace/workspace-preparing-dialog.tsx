"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  clearWorkspacePreparing,
  getWorkspacePreparingState,
  subscribeWorkspacePreparing,
  type WorkspacePreparingState,
} from "@/lib/workspace/preparing-store";

function isOnTargetDashboard(pathname: string, targetSlug: string | null): boolean {
  if (!targetSlug) return false;
  return (
    pathname === `/${targetSlug}/dashboard` || pathname.startsWith(`/${targetSlug}/dashboard/`)
  );
}

function preparingTitle(workspaceName?: string) {
  if (!workspaceName) return "Preparing your workspace";
  if (workspaceName === "Joining workspace") return "Joining workspace";
  return `Preparing ${workspaceName}`;
}

/**
 * Blocking overlay while a workspace is created/joined and the dashboard redirects.
 * Mounted once in root layout; driven by `preparing-store`.
 */
export function WorkspacePreparingDialog() {
  const pathname = usePathname();
  const state = React.useSyncExternalStore<WorkspacePreparingState | null>(
    subscribeWorkspacePreparing,
    getWorkspacePreparingState,
    () => null,
  );

  React.useEffect(() => {
    if (!state) return;

    const safetyTimeoutId = window.setTimeout(() => {
      clearWorkspacePreparing();
    }, 15000);

    return () => window.clearTimeout(safetyTimeoutId);
  }, [state]);

  React.useEffect(() => {
    if (!state) return;
    if (!isOnTargetDashboard(pathname, state.targetSlug)) return;

    const timeoutId = window.setTimeout(() => {
      clearWorkspacePreparing();
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, state]);

  const title = preparingTitle(state?.workspaceName);
  const description =
    state?.workspaceName === "Joining workspace"
      ? "We're adding you to the workspace and opening your dashboard. This will only take a moment — please wait."
      : "We're setting up your workspace and dashboard. This will only take a moment — please wait.";

  return (
    <Dialog open={state !== null}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent
        className="max-w-md gap-0 border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Empty className="bg-card border shadow-sm">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner className="size-5" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold">{title}</EmptyTitle>
            <DialogDescription className="text-muted-foreground text-sm/relaxed">
              {description}
            </DialogDescription>
          </EmptyHeader>
        </Empty>
      </DialogContent>
    </Dialog>
  );
}
