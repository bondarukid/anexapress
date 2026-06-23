"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { updateWorkspaceSettingsAction } from "@/actions/workspace/update-workspace";
import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { WorkspaceSettingsFormFields } from "@/components/dashboard/settings/workspace/sections/workspace-settings-form-fields";
import { toast } from "@/components/toasts";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import {
  defaultWorkspaceCreateFormValues,
  isWorkspaceSettingsFormValid,
  type WorkspaceCreateFormValues,
} from "@/lib/ui/workspace-create-form";
import { workspacePath } from "@/lib/routing/workspace-paths";
import type { WorkspaceSummary } from "@/types/workspace";

type WorkspaceGeneralSectionProps = {
  workspace: WorkspaceSummary;
  canUpdate: boolean;
};

export function WorkspaceGeneralSection({ workspace, canUpdate }: WorkspaceGeneralSectionProps) {
  const router = useRouter();
  const { updateWorkspace } = useWorkspace();

  const [values, setValues] = React.useState<WorkspaceCreateFormValues>(() => ({
    ...defaultWorkspaceCreateFormValues(),
    workspaceName: workspace.name,
    workspaceUrl: workspace.slug,
  }));
  const [isSaving, setIsSaving] = React.useState(false);

  const slugCheck = useWorkspaceSlugCheck(
    values.workspaceUrl,
    400,
    workspace.id,
    workspace.slug,
  );
  const canSubmit = canUpdate && isWorkspaceSettingsFormValid(values, slugCheck, workspace.slug);
  const isDirty =
    values.workspaceName.trim() !== workspace.name.trim() ||
    values.workspaceUrl.trim() !== workspace.slug.trim();

  const handleSave = async () => {
    if (!canSubmit || !isDirty) return;

    setIsSaving(true);

    const savePromise = async () => {
      const result = await updateWorkspaceSettingsAction({
        workspaceId: workspace.id,
        workspaceName: values.workspaceName.trim(),
        workspaceUrl: values.workspaceUrl.trim(),
        timezone: workspace.timezone,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    };

    try {
      await toast.promise.track(savePromise(), {
        loading: "Saving workspace settings…",
        success: (result) => {
          updateWorkspace(result.workspace);
          if (result.slugChanged) {
            router.replace(workspacePath(result.workspace.slug, "/settings/workspace"));
          }
          router.refresh();
          setIsSaving(false);
          return "Workspace settings saved.";
        },
        error: (error) => {
          setIsSaving(false);
          return error instanceof Error ? error.message : "Failed to save workspace settings.";
        },
      });
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSectionLayout
      title="Workspace"
      description="Update your workspace name and the public URL members use to access it."
    >
      <WorkspaceSettingsFormFields
        values={values}
        onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
        excludeWorkspaceId={workspace.id}
        originalSlug={workspace.slug}
        disabled={!canUpdate || isSaving}
      />
      {canUpdate ? (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSubmit || !isDirty || isSaving}
            className="max-sm:w-full"
          >
            {isSaving ? "Saving Changes…" : "Save Changes"}
          </Button>
        </div>
      ) : null}
    </SettingsSectionLayout>
  );
}
