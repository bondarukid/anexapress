"use server";

import { getCurrentUser } from "@/services/user";
import { getUnreadNotificationCount } from "@/services/notifications";

export async function getUnreadCountAction(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return getUnreadNotificationCount(user.id, user.email);
}
