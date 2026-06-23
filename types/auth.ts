import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import type { OAuthProvider } from "@/schemas/auth-schema";

export type { OAuthProvider };

/** Serializable UI state returned when auth fails, needs user attention, or should navigate client-side. */
export type AuthActionState = {
  error?: string;
  info?: string;
  redirectTo?: string;
} | null;

/** Result from OAuth sign-in server actions that redirect to a provider. */
export type OAuthRedirectResult =
  | { url: string; error?: undefined }
  | { url?: undefined; error: string };

/** All login methods shown on the Connect Accounts settings page. */
export type LoginMethodId = "email" | OAuthProvider;

/** Button action the UI may offer for a login-method card. */
export type LoginMethodAction = "connect" | "disconnect" | "setup-email" | "none";

/** Lucide stroke icon or brand SVG component used in login-method cards. */
export type LoginMethodIcon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Serializable card state passed from Server Components to Client Components.
 * Must not include React components (e.g. Lucide icons).
 */
export type LoginMethodCardSnapshot = {
  id: LoginMethodId;
  title: string;
  description: string;
  brandColor: string;
  connected: boolean;
  /** Email address or @username shown when the method is linked. */
  accountLabel?: string;
  action: LoginMethodAction;
};

/** Full card state used inside Client Components after icons are attached. */
export type LoginMethodCardState = LoginMethodCardSnapshot & {
  icon: LoginMethodIcon;
  /** When true, icon keeps its own fills (multi-color brand logos). */
  brandIcon?: boolean;
};

/** Serializable snapshot passed from the server page to the client block. */
export type LinkedAccountsSnapshot = {
  cards: LoginMethodCardSnapshot[];
  email: string;
};

/** Result shape for mutations that redirect to an OAuth provider. */
export type LinkOAuthResult =
  | { url: string; error?: undefined }
  | { url?: undefined; error: string };

/** Result shape for unlink / enable-email server actions. */
export type LinkedAccountActionResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };
