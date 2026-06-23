"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

import {
  enableEmailLogin,
  linkOAuthAccount,
  unlinkOAuthAccount,
} from "@/actions/user/linked-accounts";
import { LinkedAccountsBlock } from "@/components/dashboard/settings/account/profile-settings/linked-accounts/linked-accounts-block";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";
import { workspacePath } from "@/lib/routing/workspace-paths";
import type {
  LinkedAccountsSnapshot,
  LoginMethodAction,
  LoginMethodId,
  OAuthProvider,
} from "@/types/auth";

const passwordRequirements = [
  { regex: /.{12,}/, text: "At least 12 characters" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[0-9]/, text: "At least 1 number" },
];

interface ConnectAccountProps {
  initialSnapshot: LinkedAccountsSnapshot;
}

const ConnectAccount = ({ initialSnapshot }: ConnectAccountProps) => {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const { activeWorkspace } = useWorkspace();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<LoginMethodId | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Surface OAuth callback errors (?linkError=) once on mount.
  useEffect(() => {
    const linkError = searchParams.get("linkError");
    if (!linkError) return;

    toast.error(linkError);
    if (!activeWorkspace) return;
    router.replace(workspacePath(activeWorkspace.slug, "/settings/account"));
  }, [activeWorkspace, toast, router, searchParams]);

  const strength = useMemo(
    () => passwordRequirements.map((req) => ({ ...req, met: req.regex.test(password) })),
    [password],
  );

  const strengthScore = strength.filter((req) => req.met).length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmitEmail =
    strengthScore === passwordRequirements.length && passwordsMatch && !isPending;

  const handleAction = useCallback(
    (methodId: LoginMethodId, action: LoginMethodAction) => {
      if (action === "setup-email") {
        setEmailDialogOpen(true);
        return;
      }

      if (action === "connect") {
        const provider = methodId as OAuthProvider;
        setPendingId(methodId);
        startTransition(async () => {
          const result = await linkOAuthAccount(provider);
          if (result.error || !result.url) {
            toast.error(result.error ?? "Failed to start linking.");
            setPendingId(null);
            return;
          }
          window.location.href = result.url;
        });
        return;
      }

      if (action === "disconnect") {
        const provider = methodId as OAuthProvider;
        setPendingId(methodId);
        startTransition(async () => {
          const result = await unlinkOAuthAccount(provider);
          setPendingId(null);
          if (result.success) {
            toast.success(`${methodId === "google" ? "Google" : "GitHub"} disconnected.`);
            router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }
    },
    [toast, router],
  );

  const handleEnableEmail = () => {
    if (!canSubmitEmail) return;

    setPendingId("email");
    startTransition(async () => {
      const result = await enableEmailLogin(password);
      setPendingId(null);

      if (result.success) {
        toast.success("Email login enabled.");
        setEmailDialogOpen(false);
        setPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col">
        <h3 className="text-foreground font-semibold">Connect Accounts</h3>
        <p className="text-muted-foreground text-sm">
          Manage sign-in methods linked to your account.
        </p>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <LinkedAccountsBlock
          cards={initialSnapshot.cards}
          onAction={handleAction}
          pendingId={pendingId}
        />
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up email login</DialogTitle>
            <DialogDescription>
              Add a password to sign in with{" "}
              <span className="text-foreground font-medium">{initialSnapshot.email}</span>. Once
              configured, email login cannot be removed.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="setup-password" id={getFieldLabelId("setup-password")}>
                Password
              </FieldLabel>
              <Input
                id="setup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="setup-confirm-password"
                id={getFieldLabelId("setup-confirm-password")}
              >
                Confirm password
              </FieldLabel>
              <Input
                id="setup-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </Field>

            <ul className="space-y-1">
              {strength.map((req) => (
                <li
                  key={req.text}
                  className={cn(
                    "text-xs",
                    req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
                  )}
                >
                  {req.text}
                </li>
              ))}
              <li
                className={cn(
                  "text-xs",
                  passwordsMatch ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
                )}
              >
                Passwords match
              </li>
            </ul>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleEnableEmail} disabled={!canSubmitEmail}>
              {isPending ? "Saving…" : "Enable email login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectAccount;
