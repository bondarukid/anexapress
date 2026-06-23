import type { ButtonsInputGroupProps } from "@/components/inputs/input-groups/types";

export const buttonsPresets = {
  copy: {
    variant: "copy",
    readOnly: true,
  },
  multipleActions: {
    variant: "multipleActions",
    readOnly: true,
  },
  search: {
    variant: "search",
  },
  passwordActions: {
    variant: "passwordActions",
  },
} satisfies Record<string, Partial<ButtonsInputGroupProps>>;
