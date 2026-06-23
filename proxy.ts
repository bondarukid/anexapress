import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  AUTH_CALLBACK_REASONS,
  loginPathWithReason,
} from "@/lib/auth/callback-reasons";
import {
  isReservedPlatformHost,
  lookupSiteByDomain,
  mapCustomDomainToInternalPath,
  normalizeHostname,
} from "@/lib/cms/site-host";
import { isDocsHost, getDocsSiteUrl } from "@/lib/docs/host";
import { getPlatformSiteUrl, isApexHost } from "@/lib/platform/host";
import { DASHBOARD_ENTRY_PATH, isWorkspaceInvitePath } from "@/lib/routing/workspace-paths";
import {
  buildWorkspacePathKey,
  isWorkspaceDashboardPath as isTenantDashboardPath,
  parseWorkspacePath,
  parseWorkspacePathKey,
  buildWorkspacePath,
} from "@/lib/workspace-family/paths";
import {
  applyTenantDashboardSuffix,
  mapLegacyDashboardPath,
  tenantDashboardRestSuffix,
} from "@/lib/routing/dashboard-entry-suffix";
import { resolveDashboardEntryRedirectInMiddleware } from "@/lib/routing/resolve-dashboard-entry-redirect-middleware";
import { setPendingJoinCodeOnResponse } from "@/lib/invites/pending-invite-cookie";
import { isSameRedirectPath } from "@/lib/routing/normalize-pathname";
import { updateSession } from "@/lib/supabase/middleware";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";

/**
 * Request proxy: refresh Supabase session cookies; protect dashboard routes;
 * redirect signed-in users away from `/` and `/login`, except `?mode=set-password` (recovery finish).
 * Routes users with workspaces away from `/dashboard` to their tenant URL.
 */

const workspaceSetupFailedLoginPath = loginPathWithReason(
  AUTH_CALLBACK_REASONS.workspaceSetupFailed,
);

function loginPathForFailureReason(
  failureReason?: (typeof AUTH_CALLBACK_REASONS)[keyof typeof AUTH_CALLBACK_REASONS],
) {
  if (failureReason === AUTH_CALLBACK_REASONS.inviteSetupRequired) {
    return loginPathWithReason(AUTH_CALLBACK_REASONS.inviteSetupRequired);
  }

  return workspaceSetupFailedLoginPath;
}

function isLoginRecoveryScreen(path: string, authReason: string | null) {
  return (
    path.startsWith("/login") &&
    (authReason === AUTH_CALLBACK_REASONS.workspaceSetupFailed ||
      authReason === AUTH_CALLBACK_REASONS.inviteSetupRequired)
  );
}

/**
 * Navigation redirects only — POST, RSC, and Server Actions must pass through.
 * Redirecting those requests makes the client show "An unexpected response was received from the server."
 */
function shouldApplyProxyRedirect(request: NextRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  if (request.headers.has("Next-Action")) {
    return false;
  }
  if (request.headers.get("RSC") === "1") {
    return false;
  }
  return true;
}

/** Copies refreshed Supabase cookies onto redirects so tokens are not dropped. */
function redirectPreservingCookies(
  request: NextRequest,
  destination: string,
  sessionResponse: NextResponse,
) {
  if (!shouldApplyProxyRedirect(request)) {
    return sessionResponse;
  }

  const url = new URL(destination, request.nextUrl.origin);
  const redirectResponse = NextResponse.redirect(url);
  const cookies = sessionResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    redirectResponse.headers.append("Set-Cookie", cookie);
  }
  return redirectResponse;
}

type WorkspaceSlugRow = {
  joined_at: string;
  workspaces: {
    slug: string;
    parent_workspace_id: string | null;
    parent: { slug: string } | { slug: string }[] | null;
  } | {
    slug: string;
    parent_workspace_id: string | null;
    parent: { slug: string } | { slug: string }[] | null;
  }[] | null;
};

function workspacePathKeyFromRow(row: WorkspaceSlugRow): string | null {
  const ws = row.workspaces;
  if (!ws) return null;
  const workspace = Array.isArray(ws) ? ws[0] : ws;
  if (!workspace?.slug) return null;

  if (workspace.parent_workspace_id) {
    const parent = Array.isArray(workspace.parent) ? workspace.parent[0] : workspace.parent;
    if (parent?.slug) {
      return buildWorkspacePathKey(parent.slug, workspace.slug);
    }
  }

  return workspace.slug;
}

async function getDefaultWorkspaceSlug(
  request: NextRequest,
  response: NextResponse,
  userId: string,
): Promise<string | null> {
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase
    .from("workspace_members")
    .select(
      "joined_at, workspaces ( slug, parent_workspace_id, parent:parent_workspace_id ( slug ) )",
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  const rows = (data ?? []) as unknown as WorkspaceSlugRow[];
  if (rows.length === 0) return null;

  const cookieSlug = request.cookies.get(ACTIVE_WORKSPACE_SLUG_COOKIE)?.value;
  if (cookieSlug) {
    const match = rows.find((row) => workspacePathKeyFromRow(row) === cookieSlug);
    const pathKey = match ? workspacePathKeyFromRow(match) : null;
    if (pathKey) return pathKey;
  }

  return workspacePathKeyFromRow(rows[0]) ?? null;
}

async function tryCustomSiteDomainRewrite(
  request: NextRequest,
  host: string,
  path: string,
): Promise<NextResponse | null> {
  if (isReservedPlatformHost(host)) return null;

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // read-only lookup
        },
      },
    },
  );

  const resolved = await lookupSiteByDomain(supabase, normalizeHostname(host));
  if (!resolved) return null;

  if (path.startsWith("/api/") || path.includes("/dashboard") || path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const internalPath = mapCustomDomainToInternalPath(resolved, path);
  if (internalPath === path) return null;

  return NextResponse.rewrite(new URL(internalPath, request.url));
}

function getWorkspacePathKeyFromPath(path: string): string | null {
  if (!isTenantDashboardPath(path)) return null;
  const parsed = parseWorkspacePath(path);
  if (!parsed) return null;
  return buildWorkspacePathKey(parsed.parentSlug, parsed.childSlug);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "";

  // Local component playground — never expose in production.
  if (path.startsWith("/developer") && process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  // Documentation subdomain — clean URLs, no dashboard/auth redirects.
  if (isDocsHost(host)) {
    if (path.startsWith("/api/")) {
      return NextResponse.next();
    }

    if (path.startsWith("/login") || path.includes("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const internalPath =
      path === "/" ? "/docs" : path.startsWith("/docs") ? path : `/docs${path}`;

    if (internalPath !== path) {
      return NextResponse.rewrite(new URL(internalPath, request.url));
    }

    return NextResponse.next();
  }

  // Apex domain — redirect all traffic to the platform subdomain (configurable via env).
  if (isApexHost(host)) {
    if (path === "/docs" || path.startsWith("/docs/")) {
      const docsBase = getDocsSiteUrl(host);
      const docsPath = path.replace(/^\/docs/, "") || "/";
      return NextResponse.redirect(new URL(docsPath, docsBase));
    }

    if (shouldApplyProxyRedirect(request)) {
      const platformBase = getPlatformSiteUrl(host);
      const destination = new URL(`${path}${request.nextUrl.search}`, platformBase);
      return NextResponse.redirect(destination, 301);
    }
  }

  const customSiteRewrite = await tryCustomSiteDomainRewrite(request, host, path);
  if (customSiteRewrite) return customSiteRewrite;

  // Main site — docs routes live on the docs subdomain only.
  if (path === "/docs" || path.startsWith("/docs/")) {
    const docsBase = getDocsSiteUrl();
    const docsPath = path.replace(/^\/docs/, "") || "/";
    return NextResponse.redirect(new URL(docsPath, docsBase));
  }

  // Supabase may return PKCE code to Site URL (/) instead of /auth/callback — forward it.
  // Skip workspace invite links: they use ?code= for the 8-char join code, not OAuth.
  const code = request.nextUrl.searchParams.get("code");
  if (
    code &&
    path !== "/auth/callback" &&
    !isWorkspaceInvitePath(path)
  ) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    if (!callback.searchParams.has("next")) {
      callback.searchParams.set("next", DASHBOARD_ENTRY_PATH);
    }
    return NextResponse.redirect(callback);
  }

  const { response, user } = await updateSession(request);

  if (isWorkspaceInvitePath(path) && code) {
    setPendingJoinCodeOnResponse(response, code);
  }

  const isPersonalDashboardPath =
    path === DASHBOARD_ENTRY_PATH ||
    path === `${DASHBOARD_ENTRY_PATH}/` ||
    path.startsWith(`${DASHBOARD_ENTRY_PATH}/`);
  const workspaceSlugFromPath = isTenantDashboardPath(path)
    ? getWorkspacePathKeyFromPath(path)
    : null;
  const isProtectedDashboard = isPersonalDashboardPath || workspaceSlugFromPath !== null;

  // Guests cannot access protected dashboard routes.
  if (!user && isProtectedDashboard) {
    return redirectPreservingCookies(request, "/login", response);
  }

  if (user && isProtectedDashboard) {
    const defaultSlug = await getDefaultWorkspaceSlug(request, response, user.id);

    if (isPersonalDashboardPath) {
      if (defaultSlug) {
        return redirectPreservingCookies(
          request,
          mapLegacyDashboardPath(path, defaultSlug),
          response,
        );
      }

      const resolved = await resolveDashboardEntryRedirectInMiddleware(
        request,
        response,
        user,
        path,
      );
      if (resolved.redirect && !isSameRedirectPath(path, resolved.redirect)) {
        return redirectPreservingCookies(request, resolved.redirect, response);
      }

      if (resolved.redirect) {
        return response;
      }

      return redirectPreservingCookies(
        request,
        loginPathForFailureReason(resolved.failureReason),
        response,
      );
    }

    if (!defaultSlug && workspaceSlugFromPath) {
      const restSuffix = tenantDashboardRestSuffix(path);
      const resolved = await resolveDashboardEntryRedirectInMiddleware(
        request,
        response,
        user,
        DASHBOARD_ENTRY_PATH,
      );

      if (resolved.redirect) {
        const destination = applyTenantDashboardSuffix(resolved.redirect, restSuffix);
        if (!isSameRedirectPath(path, destination)) {
          return redirectPreservingCookies(request, destination, response);
        }
      } else {
        return redirectPreservingCookies(
          request,
          loginPathForFailureReason(resolved.failureReason),
          response,
        );
      }
    }

    if (
      defaultSlug &&
      workspaceSlugFromPath &&
      workspaceSlugFromPath !== defaultSlug
    ) {
      const restSuffix = tenantDashboardRestSuffix(path);
      const destination = applyTenantDashboardSuffix(
        buildWorkspacePath({
          parentSlug: parseWorkspacePathKey(defaultSlug).parentSlug,
          childSlug: parseWorkspacePathKey(defaultSlug).childSlug,
        }),
        restSuffix,
      );
      if (!isSameRedirectPath(path, destination)) {
        return redirectPreservingCookies(request, destination, response);
      }
    }
  }

  // Signed-in users skip the public landing shell and auth UI — except password recovery finish on `/login`.
  if (
    user &&
    (path === "/" ||
      (path.startsWith("/login") && request.nextUrl.searchParams.get("mode") !== "set-password"))
  ) {
    const authReason = request.nextUrl.searchParams.get("reason");
    const isRecoveryScreen = isLoginRecoveryScreen(path, authReason);

    const defaultSlug = await getDefaultWorkspaceSlug(request, response, user.id);
    if (defaultSlug) {
      return redirectPreservingCookies(
        request,
        mapLegacyDashboardPath(DASHBOARD_ENTRY_PATH, defaultSlug),
        response,
      );
    }

    const resolved = await resolveDashboardEntryRedirectInMiddleware(
      request,
      response,
      user,
      DASHBOARD_ENTRY_PATH,
    );

    if (resolved.redirect) {
      return redirectPreservingCookies(request, resolved.redirect, response);
    }

    if (isRecoveryScreen) {
      return response;
    }

    return redirectPreservingCookies(
      request,
      loginPathForFailureReason(resolved.failureReason),
      response,
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
