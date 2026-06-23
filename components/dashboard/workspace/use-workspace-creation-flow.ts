"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { useWorkspace } from "@/components/providers/workspace-provider";
import { workspacePath } from "@/lib/routing/workspace-paths";
import {
  clearWorkspacePreparing,
  startWorkspacePreparing,
  updateWorkspacePreparing,
} from "@/lib/workspace/preparing-store";
import type { CreateWorkspaceResult, UpdateWorkspaceResult } from "@/types/workspace";

type RunCreationOptions = {
  workspaceName: string;
  create: () => Promise<CreateWorkspaceResult>;
};

type RunConfigureOptions = {
  workspaceName: string;
  previousSlug: string;
  configure: () => Promise<UpdateWorkspaceResult>;
};

/**
 * Shared post-submit flows: create workspace, configure existing workspace (name/slug update).
 */
export function useWorkspaceSubmitFlow() {
  const router = useRouter();
  const toast = useToast();
  const { addWorkspace, setActiveWorkspace, refreshWorkspaces, updateWorkspace } = useWorkspace();

  const runCreation = React.useCallback(
    async ({ workspaceName, create }: RunCreationOptions) => {
      startWorkspacePreparing(workspaceName);

      const result = await create();

      if (!result.success) {
        clearWorkspacePreparing();
        toast.error(result.error);
        return { success: false as const };
      }

      updateWorkspacePreparing({ targetSlug: result.workspace.slug });
      addWorkspace(result.workspace);
      setActiveWorkspace(result.workspace);
      refreshWorkspaces();
      router.push(workspacePath(result.workspace.slug));
      router.refresh();

      return { success: true as const };
    },
    [addWorkspace, toast, refreshWorkspaces, router, setActiveWorkspace],
  );

  const runConfigure = React.useCallback(
    async ({ workspaceName, previousSlug, configure }: RunConfigureOptions) => {
      const result = await configure();

      if (!result.success) {
        toast.error(result.error);
        return { success: false as const };
      }

      if (result.slugChanged) {
        startWorkspacePreparing(workspaceName);
        updateWorkspacePreparing({ targetSlug: result.workspace.slug });
        updateWorkspace(result.workspace);
        setActiveWorkspace(result.workspace);
        refreshWorkspaces();
        router.push(workspacePath(result.workspace.slug));
        router.refresh();
        return { success: true as const, slugChanged: true as const };
      }

      updateWorkspace(result.workspace);
      refreshWorkspaces();
      toast.success("Workspace updated.");
      return { success: true as const, slugChanged: false as const, previousSlug };
    },
    [refreshWorkspaces, router, setActiveWorkspace, toast, updateWorkspace],
  );

  return { runCreation, runConfigure };
}

/** @deprecated Use useWorkspaceSubmitFlow */
export function useWorkspaceCreationFlow() {
  const { runCreation } = useWorkspaceSubmitFlow();
  return { runCreation };
}
