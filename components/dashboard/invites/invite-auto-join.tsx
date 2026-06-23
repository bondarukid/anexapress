"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { workspacePath } from "@/lib/routing/workspace-paths";
import { joinByCodeWithPreparing } from "@/lib/workspace/join-by-code-client";

type InviteAutoJoinProps = {
  joinCode: string;
  workspaceSlug: string;
  workspaceName: string;
};

/**
 * Logged-in invite landing: join via code with preparing overlay, then open dashboard.
 */
export function InviteAutoJoin({ joinCode, workspaceSlug, workspaceName }: InviteAutoJoinProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    void joinByCodeWithPreparing(joinCode, {
      alreadyMemberWorkspaceSlug: workspaceSlug,
      alreadyMemberWorkspaceName: workspaceName,
    }).then((result) => {
      if (result.ok) {
        router.push(workspacePath(result.slug));
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }, [joinCode, router, workspaceName, workspaceSlug]);

  if (error) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-muted-foreground max-w-md text-center text-sm">{error}</p>
      </main>
    );
  }

  return null;
}
