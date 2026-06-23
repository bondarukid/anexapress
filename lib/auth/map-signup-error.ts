/**
 * Maps raw Supabase Auth sign-up errors to user-facing copy.
 * Used in `signUp` server action before returning `AuthActionState`.
 */
export function mapSignUpAuthError(message: string): string {
  const normalized = message.trim().toLowerCase();

  if (
    normalized.includes("user already registered") ||
    normalized.includes("email address already registered")
  ) {
    return "An account with this email already exists. Sign in or use password recovery if you forgot your password.";
  }

  if (normalized.includes("database error saving new user")) {
    return "We could not finish creating your account. If you already signed up, try signing in. Otherwise wait a moment and try again.";
  }

  return message;
}
