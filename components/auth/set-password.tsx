"use client";

import { useActionState, useEffect } from "react";
import { updatePasswordAfterRecovery, type AuthActionState } from "@/actions/auth";
import { useAuthActionRedirect } from "@/hooks/use-auth-action-redirect";
import { useToast } from "@/hooks/use-toast";
import { LogoIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import Link from "next/link";

/** Shown after `/auth/callback` establishes a recovery session (cookies already set). */
export default function SetPasswordPanel() {
  const { error: showError } = useToast();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePasswordAfterRecovery,
    null,
  );
  useAuthActionRedirect(state);

  useEffect(() => {
    if (!state?.error) {
      return;
    }

    showError(state.error, {
      id: "set-password-form-error",
      title: "Error",
    });
  }, [showError, state?.error]);

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
            <h1 className="mt-4 mb-1 text-xl font-semibold">Choose a new password</h1>
            <p className="text-sm">
              Signed in via recovery link — set a password you&apos;ll use next time.
            </p>
          </div>

          <FieldGroup className="mt-6">
            <Field>
              <FieldLabel htmlFor="new-password" id={getFieldLabelId("new-password")} className="text-sm">
                New password
              </FieldLabel>
              <Input
                type="password"
                required
                name="password"
                id="new-password"
                aria-labelledby={getFieldLabelId("new-password")}
                autoComplete="new-password"
                minLength={6}
                disabled={pending}
              />
            </Field>

            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save password"}
            </Button>
          </FieldGroup>
        </div>
      </form>
    </section>
  );
}
