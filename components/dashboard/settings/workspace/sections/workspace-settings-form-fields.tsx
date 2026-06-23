"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSiteHostLabel } from "@/lib/docs/host";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import { slugifyWorkspaceUrl } from "@/lib/ui/onboarding-feed-data";
import type { WorkspaceCreateFormValues } from "@/lib/ui/workspace-create-form";
import { cn } from "@/lib/utils";

type WorkspaceSettingsFormFieldsProps = {
  values: WorkspaceCreateFormValues;
  onChange: (patch: Partial<WorkspaceCreateFormValues>) => void;
  excludeWorkspaceId?: string;
  /** Current saved slug — skips availability API when the URL field is unchanged. */
  originalSlug?: string;
  disabled?: boolean;
  idPrefix?: string;
};

function siteHostLabel() {
  return getSiteHostLabel();
}

export function WorkspaceSettingsFormFields({
  values,
  onChange,
  excludeWorkspaceId,
  originalSlug,
  disabled = false,
  idPrefix = "",
}: WorkspaceSettingsFormFieldsProps) {
  const host = siteHostLabel();
  const slugCheck = useWorkspaceSlugCheck(
    values.workspaceUrl,
    400,
    excludeWorkspaceId,
    originalSlug,
  );
  const nameId = `${idPrefix}workspace-name`;
  const urlId = `${idPrefix}workspace-url`;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={nameId} id={getFieldLabelId(nameId)}>
          Workspace name
        </FieldLabel>
        <Input
          id={nameId}
          value={values.workspaceName}
          onChange={(event) => onChange({ workspaceName: event.target.value })}
          placeholder="Acme Inc"
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={urlId} id={getFieldLabelId(urlId)}>
          Workspace URL
        </FieldLabel>
        <div className="flex overflow-hidden rounded-lg border">
          <span className="text-muted-foreground flex shrink-0 items-center border-r px-3 text-sm">
            {host}/
          </span>
          <Input
            id={urlId}
            value={values.workspaceUrl}
            onChange={(event) =>
              onChange({
                workspaceUrl: slugifyWorkspaceUrl(event.target.value),
              })
            }
            className={cn(
              "rounded-none border-0 shadow-none focus-visible:ring-0",
              slugCheck.error && "text-destructive",
            )}
            placeholder="acme-inc"
            disabled={disabled}
          />
        </div>
        {slugCheck.checking ? (
          <p className="text-muted-foreground text-sm">Checking availability…</p>
        ) : null}
        {slugCheck.error ? <p className="text-destructive text-sm">{slugCheck.error}</p> : null}
        {!disabled &&
        !slugCheck.checking &&
        slugCheck.available === true &&
        values.workspaceUrl.length >= 3 ? (
          <p className="text-sm text-green-600 dark:text-green-500">This URL is available.</p>
        ) : null}
      </Field>
    </FieldGroup>
  );
}

export { useWorkspaceSlugCheck };
