import { isWorkspaceInvitePath } from "@/lib/routing/workspace-paths";

/** Allow only same-origin relative paths for post-auth redirect. */
export function resolveSafeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

/** Whether a post-auth redirect target is a workspace invite landing page. */
export function isWorkspaceInviteNextPath(nextPath: string): boolean {
  const [pathname] = nextPath.split("?");
  return isWorkspaceInvitePath(pathname);
}
