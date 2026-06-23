import type { StandardComboboxProps } from "@/components/comboboxes/types";

export const standardPresets = {
  simpleSingleSelect: {
    variant: "simpleSingleSelect",
  },
  withDefaultSelectedValue: {
    variant: "withDefaultSelectedValue",
    defaultValue: "next.js",
  },
  withItemIcons: {
    variant: "withItemIcons",
  },
  smallSizeVariant: {
    variant: "smallSizeVariant",
    size: "sm",
  },
  largeSizeVariant: {
    variant: "largeSizeVariant",
    size: "lg",
  },
  disabledState: {
    variant: "disabledState",
  },
  fullWidthVariant: {
    variant: "fullWidthVariant",
    fullWidth: true,
  },
} satisfies Record<string, Partial<StandardComboboxProps>>;
