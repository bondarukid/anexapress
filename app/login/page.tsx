"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LOGIN_RECOVERY_REASONS } from "@/lib/auth/callback-reasons";
import SignUpPage from "@/components/auth/sign-up";
import SignInPage from "@/components/auth/sign-in";
import ForgotPasswordPanel from "@/components/auth/forgot-password";
import SetPasswordPanel from "@/components/auth/set-password";

/**
 * Single `/login` route: swap panels client-side.
 * `mode` query selects which panel mounts (`signup`, `recover`, `set-password`).
 */
type AuthMode = "login" | "signup" | "recover" | "set-password";

function parseMode(raw: string | null): AuthMode {
  if (raw === "signup") return "signup";
  if (raw === "recover") return "recover";
  if (raw === "set-password") return "set-password";
  return "login";
}

function LoginPanels() {
  const searchParams = useSearchParams();
  const urlMode = parseMode(searchParams.get("mode"));
  const reasonParam = searchParams.get("reason");
  const forceLoginPanel =
    reasonParam !== null &&
    LOGIN_RECOVERY_REASONS.includes(reasonParam as (typeof LOGIN_RECOVERY_REASONS)[number]);

  // Local panel switches (e.g. "Create account") that don't touch the URL.
  const [override, setOverride] = useState<AuthMode | null>(null);
  const [prevUrlMode, setPrevUrlMode] = useState(urlMode);

  // When the URL changes (deep links, browser history) it takes precedence.
  if (urlMode !== prevUrlMode) {
    setPrevUrlMode(urlMode);
    setOverride(null);
  }

  const mode = forceLoginPanel ? "login" : (override ?? urlMode);
  const setMode = setOverride;

  return (
    <div className="flex min-h-screen flex-col">
      {mode === "login" ? (
        <SignInPage
          onSwitchTab={() => setMode("signup")}
          onForgotPassword={() => setMode("recover")}
        />
      ) : mode === "signup" ? (
        <SignUpPage onSwitchTab={() => setMode("login")} />
      ) : mode === "recover" ? (
        <ForgotPasswordPanel onSwitchToLogin={() => setMode("login")} />
      ) : (
        <SetPasswordPanel />
      )}
    </div>
  );
}

/** Suspense required because descendants call `useSearchParams()`. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-transparent" />}
    >
      <LoginPanels />
    </Suspense>
  );
}
