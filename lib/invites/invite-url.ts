import { workspaceInvitePath } from "@/lib/routing/workspace-paths";

/** Absolute public invite landing URL. */
export function workspaceInviteUrl(
  origin: string,
  workspaceSlug: string,
  joinCode: string,
): string {
  return `${origin.replace(/\/$/, "")}${workspaceInvitePath(workspaceSlug, joinCode)}`;
}
