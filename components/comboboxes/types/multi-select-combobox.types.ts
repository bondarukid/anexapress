import type {
  BaseComboboxProps,
  ComboboxMultiValueProps,
} from "@/components/comboboxes/types/combobox.types";

export type MultiSelectComboboxVariant =
  | "multipleItemsWithBadges"
  | "withSelectAllOption"
  | "withItemCountInTrigger"
  | "withCheckboxesVisible"
  | "withClearAllFunctionality"
  | "withMaxSelectionsLimit"
  | "selectedItemsListBelow";

export type MultiSelectComboboxProps = BaseComboboxProps &
  ComboboxMultiValueProps & {
    variant?: MultiSelectComboboxVariant;
    maxSelections?: number;
    showSelectAll?: boolean;
    showClearAll?: boolean;
    showCheckboxes?: boolean;
    selectAllLabel?: string;
    clearAllLabel?: string;
    maxSelectionsMessage?: string;
  };
