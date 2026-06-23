"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { cancelParentAttachAction } from "@/actions/workspace/cancel-parent-attach";
import { cancelWorkspaceTransferAction } from "@/actions/team/cancel-workspace-transfer";
import { declineWorkspaceInviteAction } from "@/actions/notifications/decline-invite";
import { NotificationIdSchema } from "@/schemas/notification-schema";
import { deleteUserNotification, getUserNotificationRow } from "@/services/notifications";
import type { NotificationActionResult } from "@/types/notification";

const SYNTHETIC_INVITE_PREFIX = "invite:";

export async function deleteNotificationAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  if (notificationId.startsWith(SYNTHETIC_INVITE_PREFIX)) {
    const inviteId = notificationId.slice(SYNTHETIC_INVITE_PREFIX.length);
    return declineWorkspaceInviteAction(inviteId);
  }

  const parsed = NotificationIdSchema.safeParse({ notificationId });
  if (!parsed.success) {
    return { success: false, error: "Invalid notification." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const row = await getUserNotificationRow(user.id, parsed.data.notificationId);
    if (!row) {
      return { success: false, error: "Notification not found." };
    }

    if (row.kind === "workspace_invite" && row.inviteId) {
      return declineWorkspaceInviteAction(row.inviteId);
    }

    if (row.kind === "workspace_transfer" && row.transferId) {
      return cancelWorkspaceTransferAction({ transferId: row.transferId });
    }

    if (row.kind === "workspace_parent_attach" && row.transferId) {
      return cancelParentAttachAction({ transferId: row.transferId });
    }

    const { error } = await deleteUserNotification(user.id, parsed.data.notificationId);
    if (error) {
      return { success: false, error };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}
