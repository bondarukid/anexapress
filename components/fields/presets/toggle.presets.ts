import type { ToggleFieldProps } from "@/components/fields/types";

/**
 * Kibo UI toggle field pattern presets.
 * https://www.kibo-ui.com/patterns/field/toggles
 */
export const togglePresets = {
  simpleCheckbox: {
    variant: "simpleCheckbox",
    options: [{ id: "terms", label: "I agree to the terms and conditions" }],
  },
  multipleCheckboxes: {
    variant: "multipleCheckboxes",
    legend: "Show these items on the desktop",
    legendVariant: "label",
    description: "Select the items you want to show on the desktop.",
    options: [
      { id: "hard-disks", label: "Hard disks", defaultChecked: true },
      { id: "external-disks", label: "External disks" },
      { id: "cds-dvds", label: "CDs, DVDs, and iPods" },
      { id: "connected-servers", label: "Connected servers" },
    ],
  },
  radio: {
    variant: "radio",
    label: "Notification Method",
    description: "Choose how you want to be notified.",
    defaultValue: "email",
    options: [
      { id: "notify-email", label: "Email", value: "email" },
      { id: "notify-sms", label: "SMS", value: "sms" },
      { id: "notify-push", label: "Push Notification", value: "push" },
    ],
  },
  radioWithDescriptions: {
    variant: "radioWithDescriptions",
    label: "Subscription Plan",
    description: "Yearly and lifetime plans offer significant savings.",
    defaultValue: "monthly",
    options: [
      { id: "plan-monthly", label: "Monthly ($9.99/month)", value: "monthly" },
      { id: "plan-yearly", label: "Yearly ($99.99/year)", value: "yearly" },
      { id: "plan-lifetime", label: "Lifetime ($299.99)", value: "lifetime" },
    ],
  },
  simpleSwitch: {
    variant: "simpleSwitch",
    options: [{ id: "airplane-mode", label: "Airplane Mode" }],
  },
  switchWithDescription: {
    variant: "switchWithDescription",
    options: [
      {
        id: "2fa",
        label: "Multi-factor authentication",
        description:
          "Enable multi-factor authentication. If you do not have a two-factor device, you can use a one-time code sent to your email.",
      },
    ],
  },
  checkboxWithDescription: {
    variant: "checkboxWithDescription",
    options: [
      {
        id: "sync-folders",
        label: "Sync Desktop & Documents folders",
        description:
          "Your Desktop & Documents folders are being synced with iCloud Drive. You can access them from other devices.",
        defaultChecked: true,
      },
    ],
  },
} satisfies Record<string, Partial<ToggleFieldProps>>;
