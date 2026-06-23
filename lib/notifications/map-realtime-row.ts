import type {
  NotificationItem,
  NotificationKind,
  RealtimeNotificationRow,
} from "@/types/notification";

/** Minimal item from realtime payload before server enrichment. */
export function mapRealtimeRowToNotification(row: RealtimeNotificationRow): NotificationItem {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    read: row.read_at !== null,
    createdAt: row.created_at,
    inviteId: row.invite_id,
    transferId: row.transfer_id,
    transferRole: null,
    workspaceId: null,
    workspaceName: null,
    workspaceSlug: null,
    inviterName: null,
    inviterAvatarUrl: null,
    inviteExpiresAt: null,
    joinCode: null,
    inviteUrl: null,
    parentWorkspaceSlug: null,
  };
}
