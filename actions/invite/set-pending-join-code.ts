"use server";

import { cookies } from "next/headers";

import {
  pendingJoinCodeCookieOptions,
  clearPendingJoinCodeCookieOptions,
} from "@/lib/invites/pending-invite-cookie";
import { SetPendingJoinCodeSchema } from "@/schemas/invite-schema";

export async function setPendingJoinCodeCookieAction(
  joinCode: string,
): Promise<{ success: boolean }> {
  const parsed = SetPendingJoinCodeSchema.safeParse({ joinCode });
  if (!parsed.success) {
    return { success: false };
  }

  const cookieStore = await cookies();
  cookieStore.set(pendingJoinCodeCookieOptions(parsed.data.joinCode));
  return { success: true };
}

export async function clearPendingJoinCodeCookieAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(clearPendingJoinCodeCookieOptions());
}
