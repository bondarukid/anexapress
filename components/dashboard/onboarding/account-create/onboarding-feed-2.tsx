"use client";

import * as React from "react";
import { ChevronLeftIcon, PartyPopperIcon } from "lucide-react";
import { signOut } from "@/actions/auth";
import { useToast } from "@/hooks/use-toast";

import { Step01PersonalInfo } from "@/components/dashboard/onboarding/account-create/step-01-personal-info";
import { Step02Goals } from "@/components/dashboard/onboarding/account-create/step-02-goals";
import { Step03Workspace } from "@/components/dashboard/onboarding/account-create/step-03-workspace";
import { Step04Notifications } from "@/components/dashboard/onboarding/account-create/step-04-notifications";
import { Step05Complete } from "@/components/dashboard/onboarding/account-create/step-05-complete";
import { Button } from "@/components/ui/button";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import { getOnboardingSteps } from "@/lib/onboarding/steps";
import { isOnboardingStepValid } from "@/lib/onboarding/step-validation";
import {
  defaultOnboardingFormData,
  deriveWorkspaceDefaults,
  type OnboardingFormData,
  type OnboardingStepId,
} from "@/lib/ui/onboarding-feed-data";
import { detectBrowserTimezone, FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import { cn } from "@/lib/utils";

export type OnboardingFeed2Props = {
  className?: string;
  initialFormData?: Partial<OnboardingFormData>;
  initialAvatarUrl?: string | null;
  skipWorkspaceStep?: boolean;
  configureWorkspaceId?: string;
  onComplete?: (data: OnboardingFormData) => void | Promise<void>;
};

export function OnboardingFeed2({
  className,
  initialFormData,
  initialAvatarUrl,
  skipWorkspaceStep = false,
  configureWorkspaceId,
  onComplete,
}: OnboardingFeed2Props) {
  const toast = useToast();
  const steps = React.useMemo(
    () => getOnboardingSteps({ skipWorkspace: skipWorkspaceStep }),
    [skipWorkspaceStep],
  );

  const [stepIndex, setStepIndex] = React.useState(0);
  const [formData, setFormData] = React.useState<OnboardingFormData>(() => {
    const base = {
      ...defaultOnboardingFormData(),
      ...initialFormData,
    };

    let next: OnboardingFormData = base;

    if (initialFormData?.firstName || initialFormData?.lastName) {
      if (!initialFormData.workspaceName && !initialFormData.workspaceUrl) {
        next = {
          ...base,
          ...deriveWorkspaceDefaults(base.firstName, base.lastName),
        };
      }
    }

    if (!initialFormData?.timezone || initialFormData.timezone === FALLBACK_TIMEZONE) {
      next = { ...next, timezone: detectBrowserTimezone() };
    }

    return next;
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const workspaceAutoSyncRef = React.useRef(!initialFormData?.workspaceName);
  const slugCheck = useWorkspaceSlugCheck(formData.workspaceUrl, 400, configureWorkspaceId);

  const currentStep = steps[stepIndex];
  const currentStepId = currentStep?.id;
  const isLastStep = stepIndex === steps.length - 1;
  const canContinue =
    currentStepId && isOnboardingStepValid(currentStepId, formData, slugCheck) && !isSubmitting;

  function updateFormData(patch: Partial<OnboardingFormData>) {
    setFormData((prev) => {
      if ("workspaceName" in patch || "workspaceUrl" in patch) {
        if (currentStepId === "workspace") {
          workspaceAutoSyncRef.current = false;
        }
      }

      const next = { ...prev, ...patch };

      if (workspaceAutoSyncRef.current && ("firstName" in patch || "lastName" in patch)) {
        const derived = deriveWorkspaceDefaults(next.firstName, next.lastName);
        return { ...next, ...derived };
      }

      return next;
    });
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  async function handlePrimaryAction() {
    if (!canContinue) return;

    if (isLastStep) {
      if (onComplete) {
        setIsSubmitting(true);
        try {
          await onComplete(formData);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        toast.success("Setup complete. Welcome to your dashboard!");
      }
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  function renderStepContent(stepId: OnboardingStepId) {
    switch (stepId) {
      case "personal-info":
        return (
          <Step01PersonalInfo
            data={formData}
            onChange={updateFormData}
            initialAvatarUrl={initialAvatarUrl}
          />
        );
      case "goals":
        return <Step02Goals data={formData} onChange={updateFormData} />;
      case "workspace":
        return (
          <Step03Workspace
            data={formData}
            onChange={updateFormData}
            workspaceId={configureWorkspaceId}
          />
        );
      case "notifications":
        return <Step04Notifications data={formData} onChange={updateFormData} />;
      case "complete":
        return <Step05Complete />;
      default:
        return null;
    }
  }

  if (!currentStep) return null;

  return (
    <div
      className={cn(
        "bg-card grid min-h-[560px] overflow-hidden rounded-xl border md:grid-cols-[minmax(240px,1fr)_minmax(0,1.65fr)]",
        className,
      )}
    >
      <aside className="bg-muted/40 flex flex-col justify-between border-b p-8 md:border-r md:border-b-0">
        <div className="space-y-3">
          {stepIndex > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-2 w-fit px-2"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>
          ) : null}
          <h2 className="font-heading flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {currentStep.title}
            {isLastStep ? <PartyPopperIcon className="text-primary size-6 shrink-0" /> : null}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{currentStep.description}</p>
        </div>

        <div className="space-y-6 pt-8 md:pt-0">
          <Button
            type="button"
            className="w-full"
            disabled={!canContinue}
            onClick={handlePrimaryAction}
          >
            {isSubmitting
              ? skipWorkspaceStep
                ? "Joining workspace..."
                : "Saving workspace..."
              : isLastStep
                ? skipWorkspaceStep
                  ? "Join workspace"
                  : "Go to Dashboard"
                : "Next"}
          </Button>

          {currentStepId === "personal-info" ? (
            <form action={signOut}>
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={isSubmitting}
              >
                Log out
              </Button>
            </form>
          ) : null}

          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  index === stepIndex
                    ? "bg-foreground"
                    : index < stepIndex
                      ? "bg-foreground/50"
                      : "bg-muted-foreground/25",
                )}
              />
            ))}
          </div>
        </div>
      </aside>

      <div
        className={cn(
          isLastStep
            ? "flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-6"
            : "overflow-y-auto p-8",
        )}
      >
        {renderStepContent(currentStep.id)}
      </div>
    </div>
  );
}
