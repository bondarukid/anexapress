import { workspacePath } from "@/lib/routing/workspace-paths";

/** Query key for deep-linking to a notification on `/mail`. */
export const NOTIFICATION_QUERY_KEY = "n";

export function mailNotificationPath(workspaceSlug: string, notificationId: string): string {
  const base = workspacePath(workspaceSlug, "/mail");
  const params = new URLSearchParams({ [NOTIFICATION_QUERY_KEY]: notificationId });
  return `${base}?${params.toString()}`;
}

export function findNotificationIdFromUrl(
  notifications: { id: string; inviteId: string | null }[],
  target: string,
): string | null {
  const direct = notifications.find((n) => n.id === target);
  if (direct) return direct.id;

  if (target.startsWith("invite:")) {
    const inviteId = target.slice("invite:".length);
    const byInvite = notifications.find((n) => n.inviteId === inviteId);
    if (byInvite) return byInvite.id;
  }

  const byInviteId = notifications.find((n) => n.inviteId === target);
  if (byInviteId) return byInviteId.id;

  return null;
}
