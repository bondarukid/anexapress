"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { NotificationIdSchema } from "@/schemas/notification-schema";
import { markNotificationRead } from "@/services/notifications";
import type { NotificationActionResult } from "@/types/notification";

const SYNTHETIC_INVITE_PREFIX = "invite:";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  if (notificationId.startsWith(SYNTHETIC_INVITE_PREFIX)) {
    return { success: true };
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

    const { error } = await markNotificationRead(user.id, parsed.data.notificationId);
    if (error) {
      return { success: false, error };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}
