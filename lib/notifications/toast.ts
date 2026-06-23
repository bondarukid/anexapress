import type { NotificationKind } from "@/types/notification";

/** Kinds that surface a top-center toast for the recipient (not inviter activity logs). */
const TOAST_NOTIFICATION_KINDS = new Set<NotificationKind>([
  "workspace_invite",
  "system.invite_revoked_invitee",
]);

export function shouldShowNotificationToast(kind: string): kind is NotificationKind {
  return TOAST_NOTIFICATION_KINDS.has(kind as NotificationKind);
}

export function notificationToastMessage(
  kind: NotificationKind,
  title: string,
  body: string,
): { title: string; description?: string } {
  switch (kind) {
    case "workspace_invite":
      return {
        title: title,
        description: body,
      };
    case "system.invite_revoked_invitee":
      return {
        title: "Invitation withdrawn",
        description: body,
      };
    default:
      return { title, description: body };
  }
}
