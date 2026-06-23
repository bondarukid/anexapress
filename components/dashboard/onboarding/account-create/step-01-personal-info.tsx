"use client";

import * as React from "react";

import { BirthDatePicker } from "@/components/dashboard/onboarding/account-create/birth-date-picker";
import { CountrySelect } from "@/components/shared/country-select";
import { ProfileAvatarUploadSheet } from "@/components/shared/profile-avatar-upload-sheet";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  genderOptions,
  WORKSPACE_OWNER_POSITION,
  WORKSPACE_OWNER_POSITION_LABEL,
  type OnboardingFormData,
} from "@/lib/ui/onboarding-feed-data";
import { getFieldLabelId } from "@/lib/ui/field-a11y";

export type Step01PersonalInfoProps = {
  data: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  initialAvatarUrl?: string | null;
};

export function Step01PersonalInfo({
  data,
  onChange,
  initialAvatarUrl,
}: Step01PersonalInfoProps) {
  React.useEffect(() => {
    if (data.position !== WORKSPACE_OWNER_POSITION) {
      onChange({ position: WORKSPACE_OWNER_POSITION });
    }
  }, [data.position, onChange]);

  return (
    <FieldGroup>
      <div className="flex gap-4">
        <ProfileAvatarUploadSheet
          initialAvatarUrl={initialAvatarUrl}
          firstName={data.firstName}
          lastName={data.lastName}
          avatarClassName="size-20"
        />

        <div className="grid flex-1 gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first-name" id={getFieldLabelId("first-name")}>
                First Name
              </FieldLabel>
              <Input
                id="first-name"
                value={data.firstName ?? ""}
                onChange={(event) => onChange({ firstName: event.target.value })}
                placeholder="John"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="last-name" id={getFieldLabelId("last-name")}>
                Last Name
              </FieldLabel>
              <Input
                id="last-name"
                value={data.lastName ?? ""}
                onChange={(event) => onChange({ lastName: event.target.value })}
                placeholder="Doe"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="position" id={getFieldLabelId("position")}>
              Position
            </FieldLabel>
            <Input
              id="position"
              value={WORKSPACE_OWNER_POSITION_LABEL}
              disabled
              readOnly
              aria-readonly
              className="bg-muted/50"
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="gender" id={getFieldLabelId("gender")}>
            Gender
          </FieldLabel>
          <Select
            value={data.gender || undefined}
            onValueChange={(value) => onChange({ gender: value })}
          >
            <SelectTrigger id="gender" className="w-full">
              <SelectValue placeholder="Select a gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <BirthDatePicker
          value={data.dateOfBirth ?? ""}
          onChange={(dateOfBirth) => onChange({ dateOfBirth })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CountrySelect value={data.country} onChange={(country) => onChange({ country })} />
        <Field>
          <FieldLabel htmlFor="phone-number" id={getFieldLabelId("phone-number")}>
            Phone Number
          </FieldLabel>
          <Input
            id="phone-number"
            type="tel"
            value={data.phoneNumber}
            onChange={(event) => onChange({ phoneNumber: event.target.value })}
            placeholder="e.g. 9868666480"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="bio" id={getFieldLabelId("bio")}>
          Bio
        </FieldLabel>
        <Textarea
          id="bio"
          value={data.bio ?? ""}
          onChange={(event) => onChange({ bio: event.target.value })}
          placeholder="Tell us a little about yourself"
          rows={4}
        />
      </Field>
    </FieldGroup>
  );
}
