"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { acceptPendingAfterOnboardingAction } from "@/actions/invite/accept-pending-after-onboarding";
import { completeOnboardingAction } from "@/actions/onboarding/complete-onboarding";
import { completeProfileAction } from "@/actions/onboarding/complete-profile";
import { saveWorkspaceOnboardingGoalsAction } from "@/actions/onboarding/save-workspace-goals";
import { updateWorkspaceSettingsAction } from "@/actions/workspace/update-workspace";
import { OnboardingFeed2Dialog } from "@/components/dashboard/onboarding/account-create/onboarding-feed-2-dialog";
import { useWorkspaceSubmitFlow } from "@/components/dashboard/workspace/use-workspace-creation-flow";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { normalizeCountryCode } from "@/lib/countries";
import { workspacePath } from "@/lib/routing/workspace-paths";
import {
  startWorkspacePreparing,
  updateWorkspacePreparing,
} from "@/lib/workspace/preparing-store";
import {
  WORKSPACE_OWNER_POSITION,
  deriveWorkspaceDefaults,
  type OnboardingFormData,
} from "@/lib/ui/onboarding-feed-data";
import {
  mapWorkspaceCreateFormToUpdateInput,
} from "@/lib/workspace/map-create-workspace-input";
import { FALLBACK_TIMEZONE, detectBrowserTimezone } from "@/lib/timezone/timezone-options";
import { buildConfigureFormValuesFromWorkspace } from "@/lib/workspace/workspace-form-utils";
import type { CompleteProfileInput } from "@/schemas/user-schema";
import type { UserProfile } from "@/types/user";
import type { WorkspaceSummary } from "@/types/workspace";
import { useToast } from "@/hooks/use-toast";

function normalizeOnboardingMobile(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^\+[0-9]+$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  return digits.length > 0 ? `+${digits}` : undefined;
}

function buildProfilePayload(data: OnboardingFormData): CompleteProfileInput {
  const payload: CompleteProfileInput = {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    timezone: data.timezone.trim(),
  };

  const country = normalizeCountryCode(data.country);
  if (country) payload.country = country;

  const gender = data.gender?.trim();
  if (gender) payload.gender = gender;

  const mobile = normalizeOnboardingMobile(data.phoneNumber);
  if (mobile) payload.mobile = mobile;

  return payload;
}

function resolveInitialTimezone(timezone: string): string {
  if (timezone === FALLBACK_TIMEZONE) {
    return detectBrowserTimezone();
  }

  return timezone;
}

function profileToInitialFormData(
  user: UserProfile,
  configureWorkspace?: WorkspaceSummary | null,
): Partial<OnboardingFormData> {
  const workspaceValues = configureWorkspace
    ? buildConfigureFormValuesFromWorkspace(configureWorkspace)
    : {
        ...deriveWorkspaceDefaults(user.firstName ?? "", user.lastName ?? ""),
        timezone: FALLBACK_TIMEZONE,
      };

  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    position: WORKSPACE_OWNER_POSITION,
    country: normalizeCountryCode(user.country) ?? "",
    gender: user.gender ?? "",
    phoneNumber: user.mobile ?? "",
    workspaceName: workspaceValues.workspaceName,
    workspaceUrl: workspaceValues.workspaceUrl,
    timezone: resolveInitialTimezone(
      user.timezone !== FALLBACK_TIMEZONE ? user.timezone : workspaceValues.timezone,
    ),
  };
}

type OnboardingGateProps = {
  user: UserProfile;
  skipWorkspaceStep?: boolean;
  configureWorkspace?: WorkspaceSummary | null;
};

/**
 * Client glue between blocking onboarding dialog and workspace configure or invite join.
 */
export function OnboardingGate({
  user,
  skipWorkspaceStep = false,
  configureWorkspace = null,
}: OnboardingGateProps) {
  const router = useRouter();
  const toast = useToast();
  const { runCreation } = useWorkspaceSubmitFlow();
  const { updateWorkspace, setActiveWorkspace, refreshWorkspaces } = useWorkspace();

  async function markOnboardingFinished(): Promise<{ success: boolean }> {
    const result = await completeOnboardingAction();
    if (!result.success) {
      toast.error(result.error);
      return { success: false };
    }
    return { success: true };
  }

  async function persistWorkspaceGoals(
    workspaceId: string,
    goals: OnboardingFormData["goals"],
  ): Promise<{ success: boolean }> {
    const goalsResult = await saveWorkspaceOnboardingGoalsAction({
      workspaceId,
      goals,
    });

    if (!goalsResult.success) {
      if (goalsResult.code !== "forbidden") {
        toast.error(goalsResult.error);
        return { success: false };
      }
    }

    return { success: true };
  }

  async function handleComplete(data: OnboardingFormData) {
    const profilePayload = buildProfilePayload(data);

    if (skipWorkspaceStep) {
      const profileResult = await completeProfileAction(profilePayload);
      if (!profileResult.success) {
        toast.error(profileResult.error);
        return { success: false };
      }

      const joinResult = await acceptPendingAfterOnboardingAction();
      if (!joinResult.success) {
        toast.error(joinResult.error);
        return { success: false };
      }

      const ws = joinResult.data!;
      if (ws.roleSlug === "owner") {
        const goalsSaved = await persistWorkspaceGoals(ws.workspaceId, data.goals);
        if (!goalsSaved.success) return { success: false };
      }

      const finished = await markOnboardingFinished();
      if (!finished.success) return { success: false };

      return runCreation({
        workspaceName: ws.workspaceName,
        create: async () => ({
          success: true,
          workspace: {
            id: ws.workspaceId,
            name: ws.workspaceName,
            slug: ws.workspaceSlug,
            logoUrl: ws.logoUrl,
            websiteUrl: null,
            timezone: ws.timezone,
            roleSlug: ws.roleSlug,
          },
        }),
      });
    }

    if (!configureWorkspace) {
      toast.error("Workspace not found. Please refresh and try again.");
      return { success: false };
    }

    const profileResult = await completeProfileAction(profilePayload);
    if (!profileResult.success) {
      toast.error(profileResult.error);
      return { success: false };
    }

    const updateResult = await updateWorkspaceSettingsAction(
      mapWorkspaceCreateFormToUpdateInput(configureWorkspace.id, {
        workspaceName: data.workspaceName,
        workspaceUrl: data.workspaceUrl,
        timezone: data.timezone,
        companySize: data.companySize,
        industry: data.industry,
        description: data.description ?? "",
      }),
    );

    if (!updateResult.success) {
      toast.error(updateResult.error);
      return { success: false };
    }

    const goalsSaved = await persistWorkspaceGoals(configureWorkspace.id, data.goals);
    if (!goalsSaved.success) return { success: false };

    const finished = await markOnboardingFinished();
    if (!finished.success) return { success: false };

    updateWorkspace(updateResult.workspace);
    setActiveWorkspace(updateResult.workspace);
    refreshWorkspaces();

    if (updateResult.slugChanged) {
      startWorkspacePreparing(data.workspaceName.trim());
      updateWorkspacePreparing({ targetSlug: updateResult.workspace.slug });
      router.push(workspacePath(updateResult.workspace.slug));
    }

    router.refresh();
    return { success: true };
  }

  return (
    <OnboardingFeed2Dialog
      defaultOpen
      initialFormData={profileToInitialFormData(user, configureWorkspace)}
      initialAvatarUrl={user.avatarUrl}
      skipWorkspaceStep={skipWorkspaceStep}
      configureWorkspaceId={configureWorkspace?.id}
      onComplete={handleComplete}
    />
  );
}
