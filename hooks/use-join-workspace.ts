"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { useWorkspace } from "@/components/providers/workspace-provider";
import { workspacePath } from "@/lib/routing/workspace-paths";
import { joinByCodeWithPreparing } from "@/lib/workspace/join-by-code-client";

export function useJoinWorkspace() {
  const router = useRouter();
  const toast = useToast();
  const { addWorkspace, setActiveWorkspace, refreshWorkspaces } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const joinByCode = React.useCallback(
    async (rawCode: string) => {
      setIsSubmitting(true);
      try {
        const result = await joinByCodeWithPreparing(rawCode, {
          onSuccess: (ws) => {
            addWorkspace({
              id: ws.workspaceId,
              name: ws.workspaceName,
              slug: ws.workspaceSlug,
              logoUrl: ws.logoUrl,
              websiteUrl: null,
              timezone: ws.timezone,
              roleSlug: ws.roleSlug,
            });
            setActiveWorkspace({
              id: ws.workspaceId,
              name: ws.workspaceName,
              slug: ws.workspaceSlug,
              logoUrl: ws.logoUrl,
              websiteUrl: null,
              timezone: ws.timezone,
              roleSlug: ws.roleSlug,
            });
            refreshWorkspaces();
          },
        });

        if (!result.ok) {
          toast.error(result.error);
          return false;
        }

        router.push(workspacePath(result.slug));
        router.refresh();
        return true;
      } finally {
        setIsSubmitting(false);
      }
    },
    [addWorkspace, toast, refreshWorkspaces, router, setActiveWorkspace],
  );

  return { joinByCode, isSubmitting };
}
