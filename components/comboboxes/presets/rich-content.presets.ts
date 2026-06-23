import type { RichContentComboboxProps } from "@/components/comboboxes/types";

export const richContentPresets = {
  itemsWithAvatars: {
    variant: "itemsWithAvatars",
  },
  itemsWithDescriptions: {
    variant: "itemsWithDescriptions",
  },
  itemsWithStatusIndicators: {
    variant: "itemsWithStatusIndicators",
  },
  itemsWithMetadata: {
    variant: "itemsWithMetadata",
  },
  itemsWithIconsAndDescriptions: {
    variant: "itemsWithIconsAndDescriptions",
  },
  colorCodedItems: {
    variant: "colorCodedItems",
  },
  itemsWithActionButtons: {
    variant: "itemsWithActionButtons",
  },
} satisfies Record<string, Partial<RichContentComboboxProps>>;
