"use server";

import { getNotificationsForUser } from "@/services/notifications";
import { createClient } from "@/lib/server";
import type { NotificationItem } from "@/types/notification";

export type FetchNotificationsResult =
  | {
      success: true;
      notifications: NotificationItem[];
      unreadCount: number;
    }
  | { success: false; error: string };

export async function fetchNotificationsAction(): Promise<FetchNotificationsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, error: "Not authenticated." };
    }

    const notifications = await getNotificationsForUser(user.id, user.email);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return { success: true, notifications, unreadCount };
  } catch {
    return { success: false, error: "Failed to load notifications." };
  }
}
