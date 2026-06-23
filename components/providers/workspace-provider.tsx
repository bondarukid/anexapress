"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { WorkspaceAccessPermissions } from "@/types/team";
import { ACTIVE_WORKSPACE_SLUG_COOKIE, type WorkspaceSummary } from "@/types/workspace";

type WorkspaceContextValue = {
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  workspaceAccess: WorkspaceAccessPermissions;
  setActiveWorkspace: (workspace: WorkspaceSummary) => void;
  addWorkspace: (workspace: WorkspaceSummary) => void;
  updateWorkspace: (workspace: WorkspaceSummary) => void;
  refreshWorkspaces: () => void;
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

function setActiveWorkspaceCookie(pathKey: string) {
  document.cookie = `${ACTIVE_WORKSPACE_SLUG_COOKIE}=${encodeURIComponent(pathKey)}; path=/; max-age=31536000; samesite=lax`;
}

const EMPTY_WORKSPACE_ACCESS: WorkspaceAccessPermissions = {
  canUpdate: false,
  canTransfer: false,
  canDelete: false,
  canManageVisibility: false,
  canCreateContent: false,
  canPublishContent: false,
};

type WorkspaceProviderProps = {
  initialWorkspaces: WorkspaceSummary[];
  initialActiveSlug?: string | null;
  initialWorkspaceAccess?: WorkspaceAccessPermissions;
  children: React.ReactNode;
};

/**
 * Client-side workspace state for TeamSwitcher and optimistic updates after onboarding.
 *
 * `initialWorkspaces` is the source of truth (server-rendered, refreshed via
 * `router.refresh()`). Locally we track only:
 *   - `extraWorkspaces` — optimistic additions from onboarding before the server
 *     re-render arrives.
 *   - `activeId` — user's explicit workspace pick (overrides cookie/default).
 *
 * Workspaces and the active selection are derived during render, so we avoid
 * synchronous setState in useEffect (cascading renders).
 */
export function WorkspaceProvider({
  initialWorkspaces,
  initialActiveSlug,
  initialWorkspaceAccess = EMPTY_WORKSPACE_ACCESS,
  children,
}: WorkspaceProviderProps) {
  const router = useRouter();

  const [extraWorkspaces, setExtraWorkspaces] = React.useState<WorkspaceSummary[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const workspaces = React.useMemo(() => {
    const map = new Map<string, WorkspaceSummary>();
    for (const ws of initialWorkspaces) map.set(ws.id, ws);
    for (const ws of extraWorkspaces) map.set(ws.id, ws);
    return Array.from(map.values());
  }, [initialWorkspaces, extraWorkspaces]);

  const activeWorkspace = React.useMemo<WorkspaceSummary | null>(() => {
    if (workspaces.length === 0) return null;

    if (activeId) {
      const match = workspaces.find((ws) => ws.id === activeId);
      if (match) return match;
    }

    if (initialActiveSlug) {
      const slugMatch = workspaces.find(
        (ws) => ws.pathKey === initialActiveSlug || ws.slug === initialActiveSlug,
      );
      if (slugMatch) return slugMatch;
    }

    return workspaces[0];
  }, [workspaces, activeId, initialActiveSlug]);

  const setActiveWorkspace = React.useCallback((workspace: WorkspaceSummary) => {
    setActiveId(workspace.id);
    setActiveWorkspaceCookie(workspace.pathKey ?? workspace.slug);
  }, []);

  const addWorkspace = React.useCallback((workspace: WorkspaceSummary) => {
    setExtraWorkspaces((prev) => {
      if (prev.some((ws) => ws.id === workspace.id)) return prev;
      return [...prev, workspace];
    });
    setActiveId(workspace.id);
    setActiveWorkspaceCookie(workspace.pathKey ?? workspace.slug);
  }, []);

  const updateWorkspace = React.useCallback((workspace: WorkspaceSummary) => {
    setExtraWorkspaces((prev) => {
      const index = prev.findIndex((ws) => ws.id === workspace.id);
      if (index === -1) {
        return [...prev, workspace];
      }
      const next = [...prev];
      next[index] = workspace;
      return next;
    });
    setActiveId(workspace.id);
    setActiveWorkspaceCookie(workspace.pathKey ?? workspace.slug);
  }, []);

  const refreshWorkspaces = React.useCallback(() => {
    router.refresh();
  }, [router]);

  const value = React.useMemo(
    () => ({
      workspaces,
      activeWorkspace,
      workspaceAccess: initialWorkspaceAccess,
      setActiveWorkspace,
      addWorkspace,
      updateWorkspace,
      refreshWorkspaces,
    }),
    [
      workspaces,
      activeWorkspace,
      initialWorkspaceAccess,
      setActiveWorkspace,
      addWorkspace,
      updateWorkspace,
      refreshWorkspaces,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
