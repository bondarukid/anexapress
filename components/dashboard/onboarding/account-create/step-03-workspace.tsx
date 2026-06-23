"use client";

import { WorkspaceFormPanel } from "@/components/dashboard/workspace/workspace-form-panel";
import type { OnboardingFormData } from "@/lib/ui/onboarding-feed-data";

export type Step03WorkspaceProps = {
  data: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  workspaceId?: string;
};

export function Step03Workspace({ data, onChange, workspaceId }: Step03WorkspaceProps) {
  return (
    <WorkspaceFormPanel
      mode="configure"
      workspaceId={workspaceId}
      values={{
        workspaceName: data.workspaceName,
        workspaceUrl: data.workspaceUrl,
        timezone: data.timezone,
        companySize: data.companySize,
        industry: data.industry,
        description: data.description ?? "",
      }}
      onChange={onChange}
    />
  );
}
