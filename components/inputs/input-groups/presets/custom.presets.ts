import type { CustomInputGroupProps } from "@/components/inputs/input-groups/types";

export const customPresets = {
  textareaActions: {
    variant: "textareaActions",
  },
  textareaCounter: {
    variant: "textareaCounter",
    maxCount: 500,
  },
  textareaToolbar: {
    variant: "textareaToolbar",
  },
  textareaLabel: {
    variant: "textareaLabel",
    label: "Comment",
  },
} satisfies Record<string, Partial<CustomInputGroupProps>>;
