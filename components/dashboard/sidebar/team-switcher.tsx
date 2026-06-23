"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import { AddWorkspaceDialog } from "@/components/dashboard/workspace/add-workspace-dialog";
import { WorkspaceLogoMark } from "@/components/shared/workspace-logo-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { workspacePath } from "@/lib/routing/workspace-paths";
import { ENABLE_MULTI_WORKSPACE } from "@/lib/config/feature-flags";
import { formatWorkspaceRoleSlug } from "@/lib/ui/workspace-roles";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/user";
import type { WorkspaceSummary } from "@/types/workspace";

function workspaceNavigatePath(workspace: WorkspaceSummary): string {
  if (workspace.isChild && workspace.parentSlug) {
    return workspacePath({
      parentSlug: workspace.parentSlug,
      childSlug: workspace.slug,
    });
  }
  return workspacePath(workspace.slug);
}

function groupWorkspaces(workspaces: WorkspaceSummary[]): WorkspaceSummary[] {
  const roots = workspaces.filter((ws) => !ws.isChild);
  const childrenByParent = new Map<string, WorkspaceSummary[]>();

  for (const ws of workspaces) {
    if (!ws.isChild || !ws.parentId) continue;
    const list = childrenByParent.get(ws.parentId) ?? [];
    list.push(ws);
    childrenByParent.set(ws.parentId, list);
  }

  const ordered: WorkspaceSummary[] = [];
  for (const root of roots) {
    ordered.push(root);
    const children = childrenByParent.get(root.id) ?? [];
    ordered.push(...children);
  }

  const included = new Set(ordered.map((ws) => ws.id));
  for (const ws of workspaces) {
    if (!included.has(ws.id)) ordered.push(ws);
  }

  return ordered;
}

export type TeamSwitcherProps = {
  workspaces: WorkspaceSummary[];
  activeWorkspace: WorkspaceSummary | null;
  user: UserProfile;
  onWorkspaceChange?: (workspace: WorkspaceSummary) => void;
};

/**
 * Workspace switcher in the dashboard sidebar.
 * Navigates to `/{slug}/dashboard` when the user picks a different workspace.
 */
export function TeamSwitcher({
  workspaces,
  activeWorkspace,
  user,
  onWorkspaceChange,
}: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  if (!activeWorkspace && workspaces.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none opacity-70">
            <WorkspaceLogoMark name="Your workspace" size="sm" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Your workspace</span>
              <span className="truncate text-xs">Complete setup to continue</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeWorkspace) {
    return null;
  }

  function handleSelect(workspace: WorkspaceSummary) {
    onWorkspaceChange?.(workspace);
    router.push(workspaceNavigatePath(workspace));
  }

  const orderedWorkspaces = groupWorkspaces(workspaces);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <WorkspaceLogoMark
                  logoUrl={activeWorkspace.logoUrl}
                  name={activeWorkspace.name}
                  size="sm"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeWorkspace.name}</span>
                  <span className="truncate text-xs">
                    {formatWorkspaceRoleSlug(activeWorkspace.roleSlug)}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Workspaces
              </DropdownMenuLabel>
              {orderedWorkspaces.map((workspace, index) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSelect(workspace)}
                  className={cn("gap-2 p-2", workspace.isChild && "pl-8")}
                >
                  <WorkspaceLogoMark
                    logoUrl={workspace.logoUrl}
                    name={workspace.name}
                    size="sm"
                    className="size-6 rounded-md border"
                  />
                  {workspace.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              {ENABLE_MULTI_WORKSPACE ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 p-2"
                    onSelect={(event) => {
                      event.preventDefault();
                      setCreateDialogOpen(true);
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <PlusIcon className="size-4" />
                    </div>
                    <div className="font-medium">Add workspace</div>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AddWorkspaceDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} user={user} />
    </>
  );
}
