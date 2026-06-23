import type { MultiSelectComboboxProps } from "@/components/comboboxes/types";

export const multiSelectPresets = {
  multipleItemsWithBadges: {
    variant: "multipleItemsWithBadges",
  },
  withSelectAllOption: {
    variant: "withSelectAllOption",
  },
  withItemCountInTrigger: {
    variant: "withItemCountInTrigger",
  },
  withCheckboxesVisible: {
    variant: "withCheckboxesVisible",
  },
  withClearAllFunctionality: {
    variant: "withClearAllFunctionality",
  },
  withMaxSelectionsLimit: {
    variant: "withMaxSelectionsLimit",
    maxSelections: 3,
  },
  selectedItemsListBelow: {
    variant: "selectedItemsListBelow",
  },
} satisfies Record<string, Partial<MultiSelectComboboxProps>>;
