"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";

import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from "@/actions/workspace/logo";
import { updateWorkspaceWebsiteAction } from "@/actions/workspace/update-workspace-website";
import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { AvatarUploadField } from "@/components/shared/avatar-upload-field";
import { toast } from "@/components/toasts";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import type { WorkspaceSummary } from "@/types/workspace";

type WorkspaceBrandingSectionProps = {
  workspace: WorkspaceSummary;
  canUpdate: boolean;
};

export function WorkspaceBrandingSection({ workspace, canUpdate }: WorkspaceBrandingSectionProps) {
  const { updateWorkspace } = useWorkspace();
  const [preview, setPreview] = React.useState<string | null>(workspace.logoUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [website, setWebsite] = React.useState(workspace.websiteUrl ?? "");
  const [isSavingWebsite, setIsSavingWebsite] = React.useState(false);

  const normalizedWebsite = website.trim();
  const storedWebsite = workspace.websiteUrl ?? "";
  const isWebsiteDirty = normalizedWebsite !== storedWebsite;
  const canSaveWebsite = canUpdate && isWebsiteDirty && !isSavingWebsite && !isUploading;

  const handleFileSelect = async (file: File) => {
    if (!canUpdate) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("workspaceId", workspace.id);
      formData.append("logoFile", compressed);

      const uploadPromise = async () => {
        const result = await uploadWorkspaceLogoAction(formData);
        if (!result.success) throw new Error(result.error);
        return result;
      };

      await toast.promise.track(uploadPromise(), {
        loading: "Uploading logo…",
        success: (result) => {
          setPreview(result.logoUrl);
          updateWorkspace({ ...workspace, logoUrl: result.logoUrl });
          setIsUploading(false);
          return "Workspace logo updated.";
        },
        error: (error) => {
          setIsUploading(false);
          return error instanceof Error ? error.message : "Upload failed.";
        },
      });
    } catch {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!canUpdate || !preview) return;

    setIsUploading(true);

    try {
      const removePromise = async () => {
        const result = await removeWorkspaceLogoAction({ workspaceId: workspace.id });
        if (!result.success) throw new Error(result.error);
        return result;
      };

      await toast.promise.track(removePromise(), {
        loading: "Removing logo…",
        success: () => {
          setPreview(null);
          updateWorkspace({ ...workspace, logoUrl: null });
          setIsUploading(false);
          return "Workspace logo removed.";
        },
        error: (error) => {
          setIsUploading(false);
          return error instanceof Error ? error.message : "Remove failed.";
        },
      });
    } catch {
      setIsUploading(false);
    }
  };

  const handleSaveBrandFields = async () => {
    if (!canSaveWebsite) return;

    setIsSavingWebsite(true);

    try {
      const savePromise = async () => {
        const result = await updateWorkspaceWebsiteAction({
          workspaceId: workspace.id,
          websiteUrl: website,
        });
        if (!result.success) throw new Error(result.error);
        return result;
      };

      await toast.promise.track(savePromise(), {
        loading: "Saving website…",
        success: (result) => {
          updateWorkspace(result.workspace);
          setWebsite(result.workspace.websiteUrl ?? "");
          setIsSavingWebsite(false);
          return "Workspace website updated.";
        },
        error: (error) => {
          setIsSavingWebsite(false);
          return error instanceof Error ? error.message : "Failed to save website.";
        },
      });
    } catch {
      setIsSavingWebsite(false);
    }
  };

  return (
    <SettingsSectionLayout
      title="Branding"
      description="Customize how your workspace appears to members, guests, and on shared links."
    >
      <FieldGroup>
        <AvatarUploadField
          label="Workspace logo"
          hint="PNG, JPG, or WebP up to 2MB."
          preview={preview}
          previewVariant="workspace"
          fallbackText={workspace.name}
          imageAlt={workspace.name}
          uploadLabel="Upload logo"
          readOnly={!canUpdate}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
          onRemove={handleRemoveLogo}
        />

        <Field>
          <FieldLabel htmlFor="workspace-website" id={getFieldLabelId("workspace-website")}>
            Website
          </FieldLabel>
          <Input
            id="workspace-website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://acme.com"
            disabled={!canUpdate}
          />
        </Field>
      </FieldGroup>

      {canUpdate ? (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSaveBrandFields()}
            disabled={!canSaveWebsite}
            className="max-sm:w-full"
          >
            Save Changes
          </Button>
        </div>
      ) : null}
    </SettingsSectionLayout>
  );
}
