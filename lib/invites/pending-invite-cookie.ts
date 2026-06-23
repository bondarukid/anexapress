import type { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { normalizeJoinCode } from "@/lib/invites/join-code";

export const PENDING_JOIN_CODE_COOKIE = "pending_join_code";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export async function getPendingJoinCodeFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_JOIN_CODE_COOKIE)?.value;
  if (!raw) return null;
  const code = normalizeJoinCode(raw);
  return code.length === 8 ? code : null;
}

export function pendingJoinCodeCookieOptions(joinCode: string) {
  return {
    name: PENDING_JOIN_CODE_COOKIE,
    value: normalizeJoinCode(joinCode),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function clearPendingJoinCodeCookieOptions() {
  return {
    name: PENDING_JOIN_CODE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

/** Set pending join code on a Middleware / Route Handler response. */
export function setPendingJoinCodeOnResponse(response: NextResponse, rawCode: string): boolean {
  const joinCode = normalizeJoinCode(rawCode);
  if (joinCode.length !== 8) return false;

  const opts = pendingJoinCodeCookieOptions(joinCode);
  response.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return true;
}
