"use client";

import * as React from "react";

import { updateProfileTimezoneAction } from "@/actions/user/update-profile-timezone";
import { TimezoneField } from "@/components/shared/timezone-field";
import { toast } from "@/components/toasts";
import { Button } from "@/components/ui/button";
import { detectBrowserTimezone } from "@/lib/timezone/timezone-options";
import type { UserProfile } from "@/types/user";

type ProfileTimezoneSectionProps = {
  user: UserProfile;
};

/**
 * Personal timezone override in Account settings.
 * Prefills browser TZ in local state when profile still uses the UTC default.
 */
export function ProfileTimezoneSection({ user }: ProfileTimezoneSectionProps) {
  const [timezone, setTimezone] = React.useState(() => {
    if (user.timezone === "UTC") {
      return detectBrowserTimezone();
    }
    return user.timezone;
  });
  const [savedTimezone, setSavedTimezone] = React.useState(user.timezone);
  const [isSaving, setIsSaving] = React.useState(false);

  const isDirty = timezone !== savedTimezone;
  const canSave = isDirty && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);

    try {
      const savePromise = async () => {
        const result = await updateProfileTimezoneAction({ timezone });
        if (!result.success) throw new Error(result.error);
        return result;
      };

      await toast.promise.track(savePromise(), {
        loading: "Saving timezone…",
        success: (result) => {
          setSavedTimezone(result.timezone);
          setIsSaving(false);
          return "Personal timezone updated.";
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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold">Timezone</h3>
        <p className="text-muted-foreground text-sm">
          Set your personal timezone for notifications and schedules.
        </p>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <TimezoneField
          value={timezone}
          onValueChange={setTimezone}
          disabled={isSaving}
          description="This preference applies to your account."
        />
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
      </div>
    </div>
  );
}
