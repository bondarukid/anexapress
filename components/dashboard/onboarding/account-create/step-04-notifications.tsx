"use client";

import { Switch } from "@/components/ui/switch";
import { notificationOptions, type OnboardingFormData } from "@/lib/ui/onboarding-feed-data";

export type Step04NotificationsProps = {
  data: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
};

export function Step04Notifications({ data, onChange }: Step04NotificationsProps) {
  return (
    <div className="divide-y rounded-xl border">
      {notificationOptions.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
          <Switch
            checked={data.notifications[item.id]}
            onCheckedChange={(checked) =>
              onChange({
                notifications: {
                  ...data.notifications,
                  [item.id]: checked,
                },
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
