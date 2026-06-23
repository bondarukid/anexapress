"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signUp, signInWithOAuth, type AuthActionState } from "@/actions/auth";
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
import { SITE_NAME } from "@/lib/constants";

interface LoginFormProps {
  onSwitchTab: () => void;
}

export default function SignUpPage({ onSwitchTab }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const formRef = useRef<HTMLFormElement>(null);
  const { error: showError, info: showInfo, dismiss } = useToast();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  useAuthActionRedirect(state);
  const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);
  const [isOAuthPending, startOAuth] = useTransition();

  useEffect(() => {
    if (!state?.error) {
      return;
    }

    showError(state.error, {
      id: "sign-up-form-error",
      title: "Error",
    });
  }, [showError, state?.error]);

  useEffect(() => {
    if (!oauthError) {
      return;
    }

    showError(oauthError, {
      id: "sign-up-oauth-error",
      title: "Error",
    });
  }, [oauthError, showError]);

  useEffect(() => {
    if (!state?.info) {
      return;
    }

    showInfo(state.info, {
      id: "sign-up-form-info",
      title: "Info",
    });
  }, [showInfo, state?.info]);

  const handleOAuthSignIn = (provider: "google" | "github") => {
    setOauthError(null);
    dismiss("sign-up-oauth-error");
    setPendingProvider(provider);
    startOAuth(async () => {
      const result = await signInWithOAuth(provider);
      if (result.error || !result.url) {
        setOauthError(
          result.error ?? `Failed to start ${provider === "google" ? "Google" : "GitHub"} sign-in.`,
        );
        setPendingProvider(null);
        return;
      }
      window.location.href = result.url;
    });
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      {/* Same Server Action pattern as sign-in; optional profile fields map into Supabase user_metadata */}
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
            <h1 className="mt-4 mb-1 text-xl font-semibold">Create a {SITE_NAME} Account</h1>
            <p className="text-sm">Welcome! Create an account to get started</p>
          </div>

          <FieldGroup className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="firstname" id={getFieldLabelId("firstname")} className="block text-sm">
                  First name
                </FieldLabel>
                <Input
                  type="text"
                  autoComplete="given-name"
                  name="firstname"
                  id="firstname"
                  aria-labelledby={getFieldLabelId("firstname")}
                  disabled={pending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastname" id={getFieldLabelId("lastname")} className="block text-sm">
                  Last name
                </FieldLabel>
                <Input
                  type="text"
                  autoComplete="family-name"
                  name="lastname"
                  id="lastname"
                  aria-labelledby={getFieldLabelId("lastname")}
                  disabled={pending}
                />
              </Field>
            </div>

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
              <FieldLabel htmlFor="password" id={getFieldLabelId("password")} className="text-sm">
                Password
              </FieldLabel>
              <Input
                type="password"
                autoComplete="new-password"
                required
                name="password"
                id="password"
                aria-labelledby={getFieldLabelId("password")}
                className="input sz-md variant-mixed"
                disabled={pending}
              />
            </Field>

            <Button className="w-full" type="submit" disabled={pending || isOAuthPending}>
              {pending ? "Creating account…" : "Create account"}
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
              disabled={pending || pendingProvider !== null}
              onClick={() => handleOAuthSignIn("google")}
            >
              <GoogleIcon />
              <span>{pendingProvider === "google" ? "Redirecting…" : "Google"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending || pendingProvider !== null}
              onClick={() => handleOAuthSignIn("github")}
            >
              <GitHubIcon />
              <span>{pendingProvider === "github" ? "Redirecting…" : "GitHub"}</span>
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Have an account ?
            <Button type="button" variant="link" className="px-2" onClick={onSwitchTab}>
              Sign In
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
