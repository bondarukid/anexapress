"use client";

import { WorkspaceLogoMark } from "@/components/shared/workspace-logo-mark";
import { Badge } from "@/components/ui/badge";
import type { SoloOwnedWorkspaceSummary } from "@/types/user";

type SoloWorkspaceDeletionListProps = {
  workspaces: SoloOwnedWorkspaceSummary[];
};

export function SoloWorkspaceDeletionList({ workspaces }: SoloWorkspaceDeletionListProps) {
  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {workspaces.length > 10 ? (
        <Badge variant="secondary" className="text-xs">
          {workspaces.length} workspaces
        </Badge>
      ) : null}

      <div className="max-h-60 overflow-y-auto overscroll-contain rounded-lg border">
        <ul className="divide-y">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className="flex items-center gap-2 p-2">
              <WorkspaceLogoMark
                logoUrl={workspace.logoUrl}
                name={workspace.name}
                size="sm"
                className="size-6 rounded-md border"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{workspace.name}</p>
                <p className="text-muted-foreground truncate text-xs">/{workspace.slug}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
