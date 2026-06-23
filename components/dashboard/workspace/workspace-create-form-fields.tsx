"use client";

import * as React from "react";

import { TimezoneField } from "@/components/shared/timezone-field";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceSlugCheck } from "@/hooks/use-workspace-slug-check";
import {
  companySizeOptions,
  industryOptions,
  slugifyWorkspaceUrl,
} from "@/lib/ui/onboarding-feed-data";
import type { WorkspaceCreateFormValues } from "@/lib/ui/workspace-create-form";
import { detectBrowserTimezone, FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";
import { getSiteHostLabel } from "@/lib/docs/host";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

export type WorkspaceCreateFormFieldsProps = {
  values: WorkspaceCreateFormValues;
  onChange: (patch: Partial<WorkspaceCreateFormValues>) => void;
  idPrefix?: string;
  excludeWorkspaceId?: string;
  parentWorkspaceId?: string | null;
};

function siteHostLabel() {
  return getSiteHostLabel();
}

export function WorkspaceCreateFormFields({
  values,
  onChange,
  idPrefix = "",
  excludeWorkspaceId,
  parentWorkspaceId,
}: WorkspaceCreateFormFieldsProps) {
  const host = siteHostLabel();
  const slugCheck = useWorkspaceSlugCheck(
    values.workspaceUrl,
    400,
    excludeWorkspaceId,
    undefined,
    parentWorkspaceId,
  );
  const nameId = `${idPrefix}workspace-name`;
  const urlId = `${idPrefix}workspace-url`;
  const companySizeId = `${idPrefix}company-size`;
  const industryId = `${idPrefix}industry`;
  const descriptionId = `${idPrefix}workspace-description`;
  const timezoneId = `${idPrefix}workspace-timezone`;

  const didDetectTimezoneRef = React.useRef(false);

  React.useEffect(() => {
    if (didDetectTimezoneRef.current) return;
    if (values.timezone !== FALLBACK_TIMEZONE) return;

    didDetectTimezoneRef.current = true;
    onChange({ timezone: detectBrowserTimezone() });
  }, [onChange, values.timezone]);

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
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={urlId} id={getFieldLabelId(urlId)}>
          Workspace URL
        </FieldLabel>
        <div className="flex overflow-hidden rounded-lg border">
          <span className="bg-muted text-muted-foreground flex items-center px-3 text-sm">
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
          />
        </div>
        {values.workspaceUrl ? (
          <p className="text-muted-foreground text-sm">
            {values.workspaceUrl} will be visible at {host}/{values.workspaceUrl}
          </p>
        ) : null}
        {slugCheck.checking ? (
          <p className="text-muted-foreground text-sm">Checking availability…</p>
        ) : null}
        {slugCheck.error ? <p className="text-destructive text-sm">{slugCheck.error}</p> : null}
        {!slugCheck.checking && slugCheck.available === true && values.workspaceUrl.length >= 3 ? (
          <p className="text-sm text-green-600 dark:text-green-500">This URL is available.</p>
        ) : null}
      </Field>

      <TimezoneField
        id={timezoneId}
        value={values.timezone}
        onValueChange={(timezone) => onChange({ timezone })}
        description="Used for schedules, reports, and notifications across this workspace."
      />

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={companySizeId} id={getFieldLabelId(companySizeId)}>
            Company size
          </FieldLabel>
          <Select
            value={values.companySize}
            onValueChange={(value) => onChange({ companySize: value })}
          >
            <SelectTrigger id={companySizeId} className="w-full">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={industryId} id={getFieldLabelId(industryId)}>
            Industry
          </FieldLabel>
          <Select value={values.industry} onValueChange={(value) => onChange({ industry: value })}>
            <SelectTrigger id={industryId} className="w-full">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor={descriptionId} id={getFieldLabelId(descriptionId)}>
          Description (optional)
        </FieldLabel>
        <Textarea
          id={descriptionId}
          value={values.description ?? ""}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="What does your team work on?"
          rows={4}
        />
      </Field>
    </FieldGroup>
  );
}
