"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset, type AuthActionState } from "@/actions/auth";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import Link from "next/link";

interface ForgotPasswordPanelProps {
  /** Same UX pattern as switching login ↔ signup — stay on `/login` without route churn. */
  onSwitchToLogin: () => void;
}

export default function ForgotPasswordPanel({ onSwitchToLogin }: ForgotPasswordPanelProps) {
  const searchParams = useSearchParams();
  const callbackReason = searchParams.get("reason");
  const { error: showError, info: showInfo } = useToast();

  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestPasswordReset,
    null,
  );

  useEffect(() => {
    if (!callbackReason) {
      return;
    }

    showError(callbackReason, {
      id: "forgot-password-callback-error",
      title: "Error",
    });
  }, [callbackReason, showError]);

  useEffect(() => {
    if (!state?.error) {
      return;
    }

    showError(state.error, {
      id: "forgot-password-form-error",
      title: "Error",
    });
  }, [showError, state?.error]);

  useEffect(() => {
    if (!state?.info) {
      return;
    }

    showInfo(state.info, {
      id: "forgot-password-form-info",
      title: "Info",
    });
  }, [showInfo, state?.info]);

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action={formAction}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mt-4 mb-1 text-xl font-semibold">Recover Password</h1>
            <p className="text-sm">Enter your email to receive a reset link</p>
          </div>

          <FieldGroup className="mt-6">
            <Field>
              <FieldLabel htmlFor="recover-email" id={getFieldLabelId("recover-email")} className="block text-sm">
                Email
              </FieldLabel>
              <Input
                type="email"
                required
                name="email"
                id="recover-email"
                aria-labelledby={getFieldLabelId("recover-email")}
                autoComplete="email"
                placeholder="name@example.com"
                disabled={pending}
              />
            </Field>

            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              We&apos;ll email you a link to finish resetting your password.
            </p>
          </FieldGroup>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button type="button" variant="link" className="px-2" onClick={onSwitchToLogin}>
              Log in
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
