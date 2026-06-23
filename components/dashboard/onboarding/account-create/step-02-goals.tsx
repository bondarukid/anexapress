"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { goalOptions, type OnboardingFormData } from "@/lib/ui/onboarding-feed-data";
import { cn } from "@/lib/utils";

export type Step02GoalsProps = {
  data: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
};

export function Step02Goals({ data, onChange }: Step02GoalsProps) {
  const goals = data.goals ?? [];

  function toggleGoal(goalId: string, checked: boolean) {
    onChange({
      goals: checked ? [...goals, goalId] : goals.filter((goal) => goal !== goalId),
    });
  }

  return (
    <div className="space-y-3">
      {goalOptions.map((goal) => {
        const checked = goals.includes(goal.id);

        return (
          <Label
            key={goal.id}
            htmlFor={goal.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
              checked && "border-primary/30 bg-primary/5",
            )}
          >
            <Checkbox
              id={goal.id}
              checked={checked}
              onCheckedChange={(value) => toggleGoal(goal.id, !!value)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="leading-none font-medium">{goal.label}</p>
              <p className="text-muted-foreground text-sm">{goal.description}</p>
            </div>
          </Label>
        );
      })}
    </div>
  );
}
