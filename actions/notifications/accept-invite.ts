"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { InviteIdSchema } from "@/schemas/notification-schema";
import { acceptWorkspaceInvite } from "@/services/notifications";
import type { AcceptInviteResult, NotificationActionResult } from "@/types/notification";

export async function acceptWorkspaceInviteAction(
  inviteId: string,
): Promise<NotificationActionResult<AcceptInviteResult>> {
  const parsed = InviteIdSchema.safeParse({ inviteId });
  if (!parsed.success) {
    return { success: false, error: "Invalid invitation." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const result = await acceptWorkspaceInvite(user.id, parsed.data.inviteId);
    if (!result.success) return result;

    revalidatePath("/", "layout");
    return { success: true, data: result.data };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}
