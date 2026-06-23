import type { IconsInputGroupProps } from "@/components/inputs/input-groups/types";

export const iconsPresets = {
  searchIcon: {
    variant: "searchIcon",
  },
  contactFields: {
    variant: "contactFields",
  },
  dualIcons: {
    variant: "dualIcons",
  },
  multipleIcons: {
    variant: "multipleIcons",
  },
} satisfies Record<string, Partial<IconsInputGroupProps>>;
