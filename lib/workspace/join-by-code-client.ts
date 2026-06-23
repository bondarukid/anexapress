"use client";

import { joinWorkspaceByCodeAction } from "@/actions/invite/join-workspace-by-code";
import { normalizeJoinCode } from "@/lib/invites/join-code";
import {
  clearWorkspacePreparing,
  startWorkspacePreparing,
  updateWorkspacePreparing,
} from "@/lib/workspace/preparing-store";
import type { JoinWorkspaceByCodeResult } from "@/types/invite";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";

function setActiveWorkspaceSlugCookie(slug: string) {
  document.cookie = `${ACTIVE_WORKSPACE_SLUG_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=31536000; samesite=lax`;
}

export type JoinByCodeWithPreparingOptions = {
  /** When join fails with already_member, open this workspace with preparing. */
  alreadyMemberWorkspaceSlug?: string;
  alreadyMemberWorkspaceName?: string;
  onSuccess?: (workspace: JoinWorkspaceByCodeResult) => void;
};

export type JoinByCodeWithPreparingResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function joinByCodeWithPreparing(
  rawCode: string,
  options?: JoinByCodeWithPreparingOptions,
): Promise<JoinByCodeWithPreparingResult> {
  const joinCode = normalizeJoinCode(rawCode);
  if (joinCode.length !== 8) {
    return { ok: false, error: "Enter a valid 8-character join code." };
  }

  startWorkspacePreparing("Joining workspace");

  try {
    const result = await joinWorkspaceByCodeAction(joinCode);

    if (!result.success) {
      if (result.error?.includes("already a member") && options?.alreadyMemberWorkspaceSlug) {
        const slug = options.alreadyMemberWorkspaceSlug;
        updateWorkspacePreparing({
          workspaceName: options.alreadyMemberWorkspaceName ?? "your workspace",
          targetSlug: slug,
        });
        setActiveWorkspaceSlugCookie(slug);
        return { ok: true, slug };
      }

      clearWorkspacePreparing();
      return {
        ok: false,
        error: result.error ?? "Could not join workspace.",
      };
    }

    const workspace = result.data!;
    updateWorkspacePreparing({
      workspaceName: workspace.workspaceName,
      targetSlug: workspace.workspaceSlug,
    });
    setActiveWorkspaceSlugCookie(workspace.workspaceSlug);
    options?.onSuccess?.(workspace);
    return { ok: true, slug: workspace.workspaceSlug };
  } catch {
    clearWorkspacePreparing();
    return { ok: false, error: "Could not join workspace." };
  }
}
