import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  AUTH_CALLBACK_REASONS,
  loginPathWithReason,
} from "@/lib/auth/callback-reasons";
import { isWorkspaceInviteNextPath, resolveSafeNextPath } from "@/lib/auth/resolve-next-path";
import { getSiteOrigin } from "@/lib/auth/site-origin";
import { shouldSkipPersonalWorkspaceCreation } from "@/lib/onboarding/should-skip-personal-workspace";
import {
  DASHBOARD_ENTRY_PATH,
  resolveDashboardHomePath,
} from "@/lib/routing/workspace-paths";
import { ensurePersonalWorkspace } from "@/services/workspace";
import { ensureUserProfile } from "@/services/user";

/** Allow only same-origin relative paths for post-auth redirect. */
function resolveNextPath(raw: string | null, fallback: string): string {
  return resolveSafeNextPath(raw, fallback);
}

/** Copy session cookies from the PKCE exchange response onto a new redirect. */
function redirectPreservingCookies(destination: URL, sessionResponse: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(destination);
  const cookies = sessionResponse.headers.getSetCookie?.() ?? [];

  for (const cookie of cookies) {
    redirectResponse.headers.append("Set-Cookie", cookie);
  }

  return redirectResponse;
}

/**
 * Supabase PKCE callback: password recovery, OAuth sign-in, and identity linking
 * all land here with `?code=`. After exchanging the code we redirect to `next`
 * (defaults to set-password for recovery) or to the requested internal path.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const origin = getSiteOrigin() || url.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/login?mode=recover", origin));
  }

  const recoveryFallback = "/login?mode=set-password";
  let successPath = resolveNextPath(nextParam, recoveryFallback);
  const successUrl = new URL(successPath, origin);
  let response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = NextResponse.redirect(new URL(successPath, origin));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    if (successPath === DASHBOARD_ENTRY_PATH || nextParam === DASHBOARD_ENTRY_PATH) {
      const fail = new URL("/login", origin);
      fail.searchParams.set("reason", error.message);
      return NextResponse.redirect(fail);
    }

    if (nextParam) {
      const fail = new URL(resolveNextPath(nextParam, DASHBOARD_ENTRY_PATH), origin);
      fail.searchParams.set("linkError", error.message);
      return NextResponse.redirect(fail);
    }

    const fail = new URL("/login?mode=recover", origin);
    fail.searchParams.set("reason", error.message);
    return NextResponse.redirect(fail);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    user &&
    (successPath === DASHBOARD_ENTRY_PATH || successPath.startsWith(`${DASHBOARD_ENTRY_PATH}/`)) &&
    !isWorkspaceInviteNextPath(successPath)
  ) {
    const email = user.email ?? "";
    const skipPersonal = await shouldSkipPersonalWorkspaceCreation(email);
    if (!skipPersonal) {
      const firstName =
        typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : null;
      const lastName =
        typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : null;

      const profileResult = await ensureUserProfile(user.id, {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
      });
      if (profileResult.error) {
        console.error("[auth/callback] ensureUserProfile failed", {
          userId: user.id,
          email,
          error: profileResult.error,
        });
        return redirectPreservingCookies(
          new URL(loginPathWithReason(AUTH_CALLBACK_REASONS.workspaceSetupFailed), origin),
          response,
        );
      }

      const ensured = await ensurePersonalWorkspace(user.id, { firstName, lastName });
      if (ensured.success) {
        successPath = resolveDashboardHomePath(ensured.workspace.slug);
        response = redirectPreservingCookies(new URL(successPath, origin), response);
      } else {
        console.error("[auth/callback] ensurePersonalWorkspace failed", {
          userId: user.id,
          email,
          error: ensured.error,
        });
        return redirectPreservingCookies(
          new URL(loginPathWithReason(AUTH_CALLBACK_REASONS.workspaceSetupFailed), origin),
          response,
        );
      }
    }
  }

  return response;
}
