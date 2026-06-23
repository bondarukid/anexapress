import type { NotificationKind } from "@/schemas/notification-schema";

export type { NotificationKind };

export function isWorkspaceInviteNotification(kind: NotificationKind): boolean {
  return kind === "workspace_invite";
}

export function isWorkspaceTransferNotification(kind: NotificationKind): boolean {
  return kind === "workspace_transfer";
}

export function isWorkspaceParentAttachNotification(kind: NotificationKind): boolean {
  return kind === "workspace_parent_attach";
}

export function isTransferLikeNotification(kind: NotificationKind): boolean {
  return isWorkspaceTransferNotification(kind) || isWorkspaceParentAttachNotification(kind);
}

export type WorkspaceTransferNotificationRole = "recipient" | "owner";

export function isSystemNotification(kind: NotificationKind): boolean {
  return kind.startsWith("system.");
}

/** Row shape from Supabase Realtime `user_notifications` postgres_changes. */
export type RealtimeNotificationRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  invite_id: string | null;
  transfer_id: string | null;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  inviteId: string | null;
  transferId: string | null;
  transferRole: WorkspaceTransferNotificationRole | null;
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  inviterName: string | null;
  inviterAvatarUrl: string | null;
  inviteExpiresAt: string | null;
  joinCode: string | null;
  inviteUrl: string | null;
  parentWorkspaceSlug: string | null;
};

export type NotificationActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type AcceptInviteResult = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  logoUrl: string | null;
  timezone: string;
  roleSlug: string;
};
