"use client";

import * as React from "react";

import { OnboardingFeed2 } from "@/components/dashboard/onboarding/account-create/onboarding-feed-2";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { OnboardingFormData } from "@/lib/ui/onboarding-feed-data";

/** Result from onComplete — dialog closes only when success is true. */
export type OnboardingCompleteResult = { success: boolean };

export type OnboardingFeed2DialogProps = {
  defaultOpen?: boolean;
  initialFormData?: Partial<OnboardingFormData>;
  initialAvatarUrl?: string | null;
  skipWorkspaceStep?: boolean;
  configureWorkspaceId?: string;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (
    data: OnboardingFormData,
  ) => OnboardingCompleteResult | Promise<OnboardingCompleteResult | void> | void;
};

/**
 * Blocking onboarding modal — cannot be dismissed until onboarding completes successfully.
 * Step 1 exposes an explicit Log out control under Next for users who want to exit.
 */
export function OnboardingFeed2Dialog({
  defaultOpen = true,
  initialFormData,
  initialAvatarUrl,
  skipWorkspaceStep = false,
  configureWorkspaceId,
  onOpenChange,
  onComplete,
}: OnboardingFeed2DialogProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(nextOpen: boolean) {
    // Ignore close attempts until onboarding succeeds.
    if (!nextOpen) return;
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleComplete(data: OnboardingFormData) {
    if (onComplete) {
      const result = await onComplete(data);
      if (result && !result.success) return;
    }
    setOpen(false);
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent
        className="max-h-[calc(100vh-2rem)] max-w-5xl gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-5xl"
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Workspace onboarding</DialogTitle>
        <DialogDescription className="sr-only">
          Complete your profile and workspace settings to finish setting up your account.
        </DialogDescription>
        <OnboardingFeed2
          initialFormData={initialFormData}
          initialAvatarUrl={initialAvatarUrl}
          skipWorkspaceStep={skipWorkspaceStep}
          configureWorkspaceId={configureWorkspaceId}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
