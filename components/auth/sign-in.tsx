"use client";

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithOAuth, type AuthActionState } from "@/actions/auth";
import { ensureDefaultWorkspaceAction } from "@/actions/workspace/ensure-default-workspace";
import { useAuthActionRedirect } from "@/hooks/use-auth-action-redirect";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from "@/components/shared/logo";
import { GitHubIcon } from "@/components/ui/svgs/github-icon";
import { GoogleIcon } from "@/components/ui/svgs/google-icon";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import Link from "next/link";
import {
  AUTH_CALLBACK_REASONS,
  resolveAuthCallbackReasonMessage,
} from "@/lib/auth/callback-reasons";
import { resolveDashboardHomePath } from "@/lib/routing/workspace-paths";
import { SITE_NAME } from "@/lib/constants";

const SESSION_EXPIRED_ERROR = "Session expired. Please sign in again.";

interface LoginFormProps {
  /** Toggle between login / signup panels on `/login` without routing away. */
  onSwitchTab: () => void;
  /** Opens in-place recover panel (same route family as signup toggle). */
  onForgotPassword: () => void;
}

export default function SignInPage({ onSwitchTab, onForgotPassword }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const formRef = useRef<HTMLFormElement>(null);
  const autoRetryRanRef = useRef(false);
  const { show, dismiss, error: showError } = useToast();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, null);
  useAuthActionRedirect(state);
  const [oauthAttemptError, setOauthAttemptError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);
  const [isOAuthPending, startOAuth] = useTransition();
  const [isRetryingWorkspaceSetup, setIsRetryingWorkspaceSetup] = useState(false);

  const reasonParam = searchParams.get("reason");
  const isWorkspaceSetupFailed = reasonParam === AUTH_CALLBACK_REASONS.workspaceSetupFailed;
  const isInviteSetupRequired = reasonParam === AUTH_CALLBACK_REASONS.inviteSetupRequired;
  const callbackReason = resolveAuthCallbackReasonMessage(reasonParam);
  const formError = state?.error ?? callbackReason;

  const handleOAuthSignIn = useCallback(
    (provider: "google" | "github") => {
      setOauthAttemptError(null);
      dismiss("sign-in-oauth-error");
      dismiss("sign-in-form-error");
      dismiss("sign-in-workspace-retry-error");
      setPendingProvider(provider);
      startOAuth(async () => {
        try {
          const result = await signInWithOAuth(provider);
          if (result.error || !result.url) {
            setOauthAttemptError(
              result.error ??
                `Failed to start ${provider === "google" ? "Google" : "GitHub"} sign-in.`,
            );
            setPendingProvider(null);
            return;
          }
          window.location.href = result.url;
        } catch {
          setOauthAttemptError("Could not reach the server. Refresh the page and try again.");
          setPendingProvider(null);
        }
      });
    },
    [dismiss, startOAuth],
  );

  const showSessionExpiredRecovery = useCallback(() => {
    showError(SESSION_EXPIRED_ERROR, {
      id: "sign-in-workspace-retry-error",
      title: "Session expired",
      action: {
        label: pendingProvider === "google" ? "Redirecting…" : "Continue with Google",
        onClick: () => handleOAuthSignIn("google"),
      },
    });
  }, [handleOAuthSignIn, pendingProvider, showError]);

  const handleRetryWorkspaceSetup = useCallback(async () => {
    setIsRetryingWorkspaceSetup(true);
    try {
      const result = await ensureDefaultWorkspaceAction();
      if (result.success) {
        window.location.href = resolveDashboardHomePath(result.workspace.slug);
        return;
      }

      if (result.error === SESSION_EXPIRED_ERROR) {
        showSessionExpiredRecovery();
        return;
      }

      showError(result.error ?? "Workspace setup failed. Please try again.", {
        id: "sign-in-workspace-retry-error",
        title: "Error",
        action: {
          label: "Continue with Google",
          onClick: () => handleOAuthSignIn("google"),
        },
      });
    } catch {
      showError("Could not reach the server. Refresh the page and try again.", {
        id: "sign-in-workspace-retry-error",
        title: "Connection error",
        action: {
          label: "Continue with Google",
          onClick: () => handleOAuthSignIn("google"),
        },
      });
    } finally {
      setIsRetryingWorkspaceSetup(false);
    }
  }, [handleOAuthSignIn, showError, showSessionExpiredRecovery]);

  useEffect(() => {
    if (!isWorkspaceSetupFailed || autoRetryRanRef.current) {
      return;
    }

    autoRetryRanRef.current = true;
    void handleRetryWorkspaceSetup();
  }, [handleRetryWorkspaceSetup, isWorkspaceSetupFailed]);

  useEffect(() => {
    if (!formError) {
      return;
    }

    const toastAction = (() => {
      if (isWorkspaceSetupFailed) {
        return {
          label: isRetryingWorkspaceSetup ? "Retrying…" : "Retry setup",
          onClick: () => {
            void handleRetryWorkspaceSetup();
          },
        };
      }

      if (isInviteSetupRequired) {
        return {
          label: pendingProvider === "google" ? "Redirecting…" : "Continue with Google",
          onClick: () => handleOAuthSignIn("google"),
        };
      }

      return {
        label: "Retry",
        onClick: () => formRef.current?.requestSubmit(),
      };
    })();

    show({
      id: "sign-in-form-error",
      tone: "error",
      title: "Error",
      description: formError,
      action: toastAction,
    });
  }, [
    formError,
    handleOAuthSignIn,
    handleRetryWorkspaceSetup,
    isInviteSetupRequired,
    isRetryingWorkspaceSetup,
    isWorkspaceSetupFailed,
    pendingProvider,
    show,
  ]);

  useEffect(() => {
    if (!oauthAttemptError) {
      return;
    }

    showError(oauthAttemptError, {
      id: "sign-in-oauth-error",
      title: "Error",
    });
  }, [oauthAttemptError, showError]);

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        ref={formRef}
        action={formAction}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        {nextParam ? <input type="hidden" name="next" value={nextParam} /> : null}
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mt-4 mb-1 text-xl font-semibold">Sign In to {SITE_NAME}</h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>

          {isWorkspaceSetupFailed ? (
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Signed in with Google? Use <strong>Retry setup</strong> above or click Google below —
              no password needed.
            </p>
          ) : null}

          <FieldGroup className="mt-6">
            <Field>
              <FieldLabel htmlFor="email" id={getFieldLabelId("email")} className="block text-sm">
                Email
              </FieldLabel>
              <Input
                type="email"
                autoComplete="email"
                required
                name="email"
                id="email"
                aria-labelledby={getFieldLabelId("email")}
                disabled={pending}
              />
            </Field>

            <Field className="gap-0.5">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" id={getFieldLabelId("password")} className="text-sm">
                  Password
                </FieldLabel>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="link intent-info variant-ghost h-auto p-0 text-sm"
                  onClick={onForgotPassword}
                >
                  Forgot your Password ?
                </Button>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                required
                name="password"
                id="password"
                aria-labelledby={getFieldLabelId("password")}
                className="input sz-md variant-mixed"
                disabled={pending}
              />
            </Field>

            <Button className="w-full" type="submit" disabled={pending || isOAuthPending}>
              {pending ? "Signing in…" : "Sign In"}
            </Button>
          </FieldGroup>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">Or continue With</span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending || pendingProvider !== null || isRetryingWorkspaceSetup}
              onClick={() => handleOAuthSignIn("google")}
            >
              <GoogleIcon />
              <span>{pendingProvider === "google" ? "Redirecting…" : "Google"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending || pendingProvider !== null || isRetryingWorkspaceSetup}
              onClick={() => handleOAuthSignIn("github")}
            >
              <GitHubIcon />
              <span>{pendingProvider === "github" ? "Redirecting…" : "GitHub"}</span>
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don&apos;t have an account ?
            <Button type="button" variant="link" className="px-2" onClick={onSwitchTab}>
              Create account
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
