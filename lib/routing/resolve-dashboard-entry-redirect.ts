import { cookies } from "next/headers";

import { getPendingJoinCodeFromCookies } from "@/lib/invites/pending-invite-cookie";
import { shouldSkipPersonalWorkspaceCreation } from "@/lib/onboarding/should-skip-personal-workspace";
import { mapLegacyDashboardPath } from "@/lib/routing/dashboard-entry-suffix";
import { workspaceInvitePath } from "@/lib/routing/workspace-paths";
import {
  getFirstPendingEmailInvite,
  getInviteLandingContext,
} from "@/services/invite";
import {
  ensurePersonalWorkspace,
  getUserWorkspaces,
  resolveDefaultWorkspace,
} from "@/services/workspace";
import { ACTIVE_WORKSPACE_SLUG_COOKIE } from "@/types/workspace";

export type ResolveDashboardEntryRedirectInput = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  /** e.g. "/dashboard", "/dashboard/invites", "/dashboard/settings/account" */
  pathname: string;
};

/**
 * Resolves where a signed-in user should land when hitting legacy `/dashboard/*` URLs.
 * Returns null when no tenant redirect is possible (rare invite-only edge case).
 */
export async function resolveDashboardEntryRedirect(
  input: ResolveDashboardEntryRedirectInput,
): Promise<string | null> {
  const workspaceResult = await getUserWorkspaces(input.userId);
  if (!workspaceResult.success) {
    return null;
  }

  const workspaces = workspaceResult.workspaces;

  if (workspaces.length > 0) {
    const cookieStore = await cookies();
    const activeSlug = cookieStore.get(ACTIVE_WORKSPACE_SLUG_COOKIE)?.value;
    const defaultWorkspace = resolveDefaultWorkspace(workspaces, activeSlug) ?? workspaces[0];
    return mapLegacyDashboardPath(input.pathname, defaultWorkspace.slug);
  }

  const skipPersonal = await shouldSkipPersonalWorkspaceCreation(input.email);
  if (skipPersonal) {
    return resolveInviteOnlyRedirect(input.email);
  }

  const ensured = await ensurePersonalWorkspace(input.userId, {
    firstName: input.firstName,
    lastName: input.lastName,
  });

  if (!ensured.success) {
    return null;
  }

  return mapLegacyDashboardPath(input.pathname, ensured.workspace.slug);
}

/** Redirect invite-only users without membership back to an invite landing when possible. */
async function resolveInviteOnlyRedirect(email: string): Promise<string | null> {
  const pendingCode = await getPendingJoinCodeFromCookies();
  if (pendingCode) {
    const context = await getInviteLandingContext(pendingCode);
    if (context?.workspaceSlug) {
      return workspaceInvitePath(context.workspaceSlug, pendingCode);
    }
  }

  const pendingEmailInvite = await getFirstPendingEmailInvite(email);
  if (pendingEmailInvite) {
    return workspaceInvitePath(pendingEmailInvite.workspaceSlug, pendingEmailInvite.joinCode);
  }

  return null;
}
