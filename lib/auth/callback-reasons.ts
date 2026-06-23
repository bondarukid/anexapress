/** Query `reason` values set by middleware and auth routes on `/login`. */
export const AUTH_CALLBACK_REASONS = {
  workspaceSetupFailed: "workspace-setup-failed",
  inviteSetupRequired: "invite-setup-required",
} as const;

export type AuthCallbackReason =
  (typeof AUTH_CALLBACK_REASONS)[keyof typeof AUTH_CALLBACK_REASONS];

/** Login callback reasons that keep the sign-in panel mounted with a recovery toast. */
export const LOGIN_RECOVERY_REASONS: AuthCallbackReason[] = [
  AUTH_CALLBACK_REASONS.workspaceSetupFailed,
  AUTH_CALLBACK_REASONS.inviteSetupRequired,
];

/**
 * Resolves middleware/auth callback `reason` query params to user-facing messages.
 * Unknown reasons are returned as-is (e.g. Supabase OAuth error text).
 */
export function resolveAuthCallbackReasonMessage(reason: string | null): string | null {
  if (!reason) {
    return null;
  }

  switch (reason) {
    case AUTH_CALLBACK_REASONS.workspaceSetupFailed:
      return "Your sign-in succeeded, but we could not finish workspace setup. Try again, or sign in with Google to continue.";
    case AUTH_CALLBACK_REASONS.inviteSetupRequired:
      return "Your sign-in succeeded. Open the invite link from your email to join a workspace, or ask your team admin to resend the invitation.";
    default:
      return reason;
  }
}

/** Builds `/login` path with a known callback reason. */
export function loginPathWithReason(reason: AuthCallbackReason): string {
  return `/login?reason=${encodeURIComponent(reason)}`;
}
