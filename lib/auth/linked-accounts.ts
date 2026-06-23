import type {
  LoginMethodAction,
  LoginMethodCardSnapshot,
  LoginMethodId,
  OAuthProvider,
} from "@/types/auth";

/** Minimal identity shape from `supabase.auth.getUserIdentities()`. */
export type AuthIdentity = {
  provider: string;
  identity_data?: Record<string, unknown>;
};

/** Static display copy for the three supported login methods (no icons — safe for server). */
const LOGIN_METHOD_COPY: Record<
  LoginMethodId,
  Pick<LoginMethodCardSnapshot, "title" | "description" | "brandColor">
> = {
  email: {
    title: "Email",
    description: "Sign in with your email address and password.",
    brandColor: "#2563EB",
  },
  google: {
    title: "Google",
    description:
      "Sign in quickly with your Google account without a separate password for this app.",
    brandColor: "#4285F4",
  },
  github: {
    title: "GitHub",
    description: "Sign in with your existing GitHub account — convenient for developers.",
    brandColor: "#24292F",
  },
};

const LOGIN_METHOD_IDS: LoginMethodId[] = ["email", "google", "github"];
const OAUTH_PROVIDERS: OAuthProvider[] = ["google", "github"];

/** Returns true when the user has an email+password identity (can sign in with password). */
export function hasEmailLogin(identities: AuthIdentity[]): boolean {
  return identities.some((identity) => identity.provider === "email");
}

/** Returns true when a specific OAuth provider identity is linked. */
export function hasOAuthProvider(identities: AuthIdentity[], provider: OAuthProvider): boolean {
  return identities.some((identity) => identity.provider === provider);
}

/**
 * Supabase requires at least two identities before unlinking one.
 * We additionally require email login before allowing OAuth disconnect
 * so the user never locks themselves out.
 */
export function canUnlinkOAuth(identities: AuthIdentity[], provider: OAuthProvider): boolean {
  if (!hasOAuthProvider(identities, provider)) return false;
  if (!hasEmailLogin(identities)) return false;
  return identities.length >= 2;
}

/** Resolves the display label for a linked identity (email or OAuth username). */
export function resolveIdentityLabel(
  provider: LoginMethodId,
  identities: AuthIdentity[],
  fallbackEmail: string,
): string | undefined {
  const identity = identities.find((item) => item.provider === provider);
  if (!identity) return undefined;

  if (provider === "email") {
    return fallbackEmail || undefined;
  }

  const data = identity.identity_data ?? {};
  const email = typeof data.email === "string" ? data.email : undefined;
  const name = typeof data.name === "string" ? data.name : undefined;
  const userName = typeof data.user_name === "string" ? data.user_name : undefined;
  const preferredUsername =
    typeof data.preferred_username === "string" ? data.preferred_username : undefined;

  if (provider === "github") {
    const handle = userName ?? preferredUsername;
    return handle ? `@${handle.replace(/^@/, "")}` : email;
  }

  return email ?? name;
}

/** Determines which button action the UI should expose for a given card. */
function resolveCardAction(
  id: LoginMethodId,
  connected: boolean,
  identities: AuthIdentity[],
): LoginMethodAction {
  if (id === "email") {
    // Email signup or password already set via updateUser — card is read-only.
    if (connected) return "none";
    // OAuth-only user: offer password setup to add email login.
    return "setup-email";
  }

  if (!connected) return "connect";

  // Connected OAuth: allow disconnect only when email login exists as backup.
  if (canUnlinkOAuth(identities, id)) return "disconnect";

  // Sole OAuth login method — must set up email before disconnecting.
  return "none";
}

/**
 * Builds serializable login-method cards from Supabase user identities.
 * Safe to return from Server Components — no React components included.
 */
export function buildLoginMethodCards(
  identities: AuthIdentity[],
  fallbackEmail: string,
): LoginMethodCardSnapshot[] {
  return LOGIN_METHOD_IDS.map((id) => {
    const copy = LOGIN_METHOD_COPY[id];
    const connected = id === "email" ? hasEmailLogin(identities) : hasOAuthProvider(identities, id);

    const accountLabel =
      id === "email" || id === "google" || id === "github"
        ? undefined
        : connected
          ? resolveIdentityLabel(id, identities, fallbackEmail)
          : undefined;

    return {
      id,
      ...copy,
      connected,
      accountLabel,
      action: resolveCardAction(id, connected, identities),
    };
  });
}

/** Server-side guard: validates unlink is allowed before calling Supabase. */
export function assertCanUnlinkOAuth(
  identities: AuthIdentity[],
  provider: OAuthProvider,
): string | null {
  if (!OAUTH_PROVIDERS.includes(provider)) {
    return "Unsupported provider.";
  }
  if (!hasOAuthProvider(identities, provider)) {
    return "This account is not linked.";
  }
  if (!canUnlinkOAuth(identities, provider)) {
    return "Set up email login before disconnecting this account.";
  }
  return null;
}
