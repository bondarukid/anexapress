"use client";

import * as React from "react";

import { updateWorkspaceTimezoneAction } from "@/actions/workspace/update-workspace-timezone";
import { TimezoneField } from "@/components/shared/timezone-field";
import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { toast } from "@/components/toasts";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkspaceSummary } from "@/types/workspace";

type WorkspaceTimezoneSectionProps = {
  workspace: WorkspaceSummary;
  canUpdate: boolean;
};

export function WorkspaceTimezoneSection({ workspace, canUpdate }: WorkspaceTimezoneSectionProps) {
  const { updateWorkspace } = useWorkspace();
  const [timezone, setTimezone] = React.useState(workspace.timezone);
  const [isSaving, setIsSaving] = React.useState(false);

  const isDirty = timezone !== workspace.timezone;
  const canSave = canUpdate && isDirty && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);

    try {
      const savePromise = async () => {
        const result = await updateWorkspaceTimezoneAction({
          workspaceId: workspace.id,
          timezone,
        });
        if (!result.success) throw new Error(result.error);
        return result;
      };

      await toast.promise.track(savePromise(), {
        loading: "Saving timezone…",
        success: (result) => {
          updateWorkspace(result.workspace);
          setIsSaving(false);
          return "Workspace timezone updated.";
        },
        error: (error) => {
          setIsSaving(false);
          return error instanceof Error ? error.message : "Failed to save timezone.";
        },
      });
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSectionLayout
      title="Timezone"
      description="Set the default timezone used for schedules, reports, and notifications across this workspace."
    >
      <Card>
        <CardContent>
          <TimezoneField
            value={timezone}
            onValueChange={setTimezone}
            disabled={!canUpdate || isSaving}
            description="Members can still override their personal timezone in account settings."
          />
        </CardContent>
      </Card>
      {canUpdate ? (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="max-sm:w-full"
          >
            Save Changes
          </Button>
        </div>
      ) : null}
    </SettingsSectionLayout>
  );
}
