import type { LabelInputGroupProps } from "@/components/inputs/input-groups/types";

export const labelPresets = {
  inlineLabels: {
    variant: "inlineLabels",
  },
  labelTooltip: {
    variant: "labelTooltip",
    label: "Email",
  },
  blockLabels: {
    variant: "blockLabels",
    label: "Full Name",
  },
  labelCounter: {
    variant: "labelCounter",
    maxCount: 60,
  },
} satisfies Record<string, Partial<LabelInputGroupProps>>;
