import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

import { normalizeJoinCode } from "@/lib/invites/join-code";
import { PENDING_JOIN_CODE_COOKIE } from "@/lib/invites/pending-invite-cookie";
import { AUTH_CALLBACK_REASONS, type AuthCallbackReason } from "@/lib/auth/callback-reasons";
import { mapLegacyDashboardPath } from "@/lib/routing/dashboard-entry-suffix";
import { deriveWorkspaceDefaults } from "@/lib/ui/onboarding-feed-data";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";
import { workspaceInvitePath } from "@/lib/routing/workspace-paths";

type WorkspaceSlugRow = {
  joined_at: string;
  workspaces: { slug: string } | { slug: string }[] | null;
};

function workspaceSlugFromRow(row: WorkspaceSlugRow): string | null {
  const ws = row.workspaces;
  if (!ws) return null;
  if (Array.isArray(ws)) return ws[0]?.slug ?? null;
  return ws.slug;
}

function getPendingJoinCodeFromRequest(request: NextRequest): string | null {
  const raw = request.cookies.get(PENDING_JOIN_CODE_COOKIE)?.value;
  if (!raw) return null;
  const code = normalizeJoinCode(raw);
  return code.length === 8 ? code : null;
}

function createMiddlewareSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
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
}

async function getDefaultWorkspaceSlug(
  request: NextRequest,
  response: NextResponse,
  userId: string,
): Promise<string | null> {
  const supabase = createMiddlewareSupabase(request, response);

  const { data } = await supabase
    .from("workspace_members")
    .select("joined_at, workspaces ( slug )")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  const rows = (data ?? []) as unknown as WorkspaceSlugRow[];
  if (rows.length === 0) return null;

  const cookieSlug = request.cookies.get(ACTIVE_WORKSPACE_SLUG_COOKIE)?.value;
  if (cookieSlug) {
    const match = rows.find((row) => workspaceSlugFromRow(row) === cookieSlug);
    const slug = match ? workspaceSlugFromRow(match) : null;
    if (slug) return slug;
  }

  return workspaceSlugFromRow(rows[0]) ?? null;
}

async function isSlugAvailable(
  supabase: ReturnType<typeof createMiddlewareSupabase>,
  slug: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_workspace_slug_available", {
    p_slug: slug,
    p_exclude_workspace_id: null,
  });

  if (error) {
    console.error("[ensurePersonalWorkspaceInMiddleware] is_workspace_slug_available failed", {
      slug,
      error: error.message,
    });
    return false;
  }

  return data === true;
}

async function generateAvailableSlug(
  supabase: ReturnType<typeof createMiddlewareSupabase>,
  baseSlug: string,
): Promise<string> {
  const normalized = baseSlug.trim().toLowerCase();
  if (normalized.length < 3) {
    return generateAvailableSlug(supabase, "my-workspace");
  }

  if (await isSlugAvailable(supabase, normalized)) {
    return normalized;
  }

  for (let i = 2; i <= 99; i += 1) {
    const suffix = `-${i}`;
    const candidate = `${normalized.slice(0, 48 - suffix.length)}${suffix}`;
    if (await isSlugAvailable(supabase, candidate)) {
      return candidate;
    }
  }

  const fallbackSuffix = `-${Date.now().toString(36).slice(-4)}`;
  return `${normalized.slice(0, 48 - fallbackSuffix.length)}${fallbackSuffix}`;
}

async function hasPendingEmailInvites(
  supabase: ReturnType<typeof createMiddlewareSupabase>,
  email: string,
): Promise<boolean> {
  const { count } = await supabase
    .from("workspace_invites")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email.trim().toLowerCase());

  return (count ?? 0) > 0;
}

async function resolveInviteOnlyRedirect(
  request: NextRequest,
  response: NextResponse,
  email: string,
): Promise<string | null> {
  const supabase = createMiddlewareSupabase(request, response);
  const pendingCode = getPendingJoinCodeFromRequest(request);

  if (pendingCode) {
    const { data } = await supabase.rpc("get_invite_landing_context", {
      p_join_code: pendingCode,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.workspace_slug) {
      return workspaceInvitePath(row.workspace_slug, pendingCode);
    }
  }

  const { data } = await supabase
    .from("workspace_invites")
    .select("join_code, workspaces ( slug )")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email.trim().toLowerCase())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data?.join_code) return null;

  const ws = data.workspaces as { slug: string } | { slug: string }[] | null;
  const slug = Array.isArray(ws) ? ws[0]?.slug : ws?.slug;
  if (!slug) return null;

  return workspaceInvitePath(slug, data.join_code);
}

async function countActiveWorkspaceMembershipsInMiddleware(
  supabase: ReturnType<typeof createMiddlewareSupabase>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("[countActiveWorkspaceMembershipsInMiddleware]", error.message);
    return 0;
  }

  return count ?? 0;
}

async function ensurePersonalWorkspaceInMiddleware(
  request: NextRequest,
  response: NextResponse,
  user: User,
): Promise<string | null> {
  const existingSlug = await getDefaultWorkspaceSlug(request, response, user.id);
  if (existingSlug) {
    return existingSlug;
  }

  const supabase = createMiddlewareSupabase(request, response);
  const membershipCount = await countActiveWorkspaceMembershipsInMiddleware(supabase, user.id);
  if (membershipCount > 0) {
    return getDefaultWorkspaceSlug(request, response, user.id);
  }

  const firstName =
    typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
  const lastName =
    typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";

  const defaults = deriveWorkspaceDefaults(firstName, lastName);
  const slug = await generateAvailableSlug(supabase, defaults.workspaceUrl);

  const { data, error } = await supabase.rpc("create_workspace_with_owner", {
    p_name: defaults.workspaceName,
    p_slug: slug,
    p_user_id: user.id,
    p_profile: {},
  });

  if (error) {
    console.error("[ensurePersonalWorkspaceInMiddleware] create_workspace_with_owner failed", {
      userId: user.id,
      slug,
      error: error.message,
    });
    return getDefaultWorkspaceSlug(request, response, user.id);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row?.slug) {
    return row.slug;
  }

  return getDefaultWorkspaceSlug(request, response, user.id);
}

export type DashboardEntryResolveResult = {
  redirect: string | null;
  failureReason?: AuthCallbackReason;
};

/**
 * Edge resolver for legacy `/dashboard/*` URLs when the user has no workspace yet.
 * Used exclusively from middleware — no App Router page required under `app/dashboard`.
 */
export async function resolveDashboardEntryRedirectInMiddleware(
  request: NextRequest,
  response: NextResponse,
  user: User,
  pathname: string,
): Promise<DashboardEntryResolveResult> {
  const defaultSlug = await getDefaultWorkspaceSlug(request, response, user.id);
  if (defaultSlug) {
    return { redirect: mapLegacyDashboardPath(pathname, defaultSlug) };
  }

  const email = user.email ?? "";
  const pendingCode = getPendingJoinCodeFromRequest(request);
  const supabase = createMiddlewareSupabase(request, response);
  const skipPersonal = Boolean(pendingCode) || (await hasPendingEmailInvites(supabase, email));

  if (skipPersonal) {
    const inviteTarget = await resolveInviteOnlyRedirect(request, response, email);
    if (inviteTarget) {
      return { redirect: inviteTarget };
    }

    return { redirect: null, failureReason: AUTH_CALLBACK_REASONS.inviteSetupRequired };
  }

  const createdSlug = await ensurePersonalWorkspaceInMiddleware(request, response, user);
  if (!createdSlug) {
    return { redirect: null, failureReason: AUTH_CALLBACK_REASONS.workspaceSetupFailed };
  }

  return { redirect: mapLegacyDashboardPath(pathname, createdSlug) };
}
