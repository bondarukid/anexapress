import type { NotificationKind } from "@/types/notification";

/** Inviter-facing notification kinds that should refresh the team pending list. */
export const TEAM_INVITE_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "system.invite_sent",
  "system.invite_revoked",
  "system.invite_accepted",
  "system.invite_declined",
]);

export function shouldRefreshTeamOnNotification(kind: string): boolean {
  return TEAM_INVITE_NOTIFICATION_KINDS.has(kind as NotificationKind);
}
