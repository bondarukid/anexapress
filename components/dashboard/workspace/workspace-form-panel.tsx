"use client";

import * as React from "react";

import { WorkspaceCreateFormFields } from "@/components/dashboard/workspace/workspace-create-form-fields";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import {
  isWorkspaceCreateFormValid,
  type WorkspaceCreateFormValues,
} from "@/lib/ui/workspace-create-form";

export type WorkspaceFormPanelProps = {
  mode: "create" | "configure";
  values: WorkspaceCreateFormValues;
  onChange: (patch: Partial<WorkspaceCreateFormValues>) => void;
  workspaceId?: string;
  idPrefix?: string;
  className?: string;
};

/**
 * Shared workspace name/url form with slug availability check.
 * Used in onboarding configure step and add-workspace dialog.
 */
export function WorkspaceFormPanel({
  mode,
  values,
  onChange,
  workspaceId,
  idPrefix = "",
  className,
}: WorkspaceFormPanelProps) {
  const excludeWorkspaceId = mode === "configure" ? workspaceId : undefined;

  return (
    <div className={className}>
      <WorkspaceCreateFormFields
        idPrefix={idPrefix}
        values={values}
        onChange={onChange}
        excludeWorkspaceId={excludeWorkspaceId}
      />
    </div>
  );
}

/** Form state + validation for workspace create/configure flows outside onboarding wizard. */
export function useWorkspaceFormState(
  initialValues: WorkspaceCreateFormValues,
  options?: { excludeWorkspaceId?: string },
) {
  const [values, setValues] = React.useState(initialValues);
  const slugCheck = useWorkspaceSlugCheck(values.workspaceUrl, 400, options?.excludeWorkspaceId);

  const canSubmit = isWorkspaceCreateFormValid(values, slugCheck);

  return {
    values,
    setValues,
    onChange: (patch: Partial<WorkspaceCreateFormValues>) =>
      setValues((prev) => ({ ...prev, ...patch })),
    slugCheck,
    canSubmit,
  };
}
