import type {
  BaseComboboxProps,
  ComboboxGroupOption,
  ComboboxNestedGroupOption,
  ComboboxSingleValueProps,
} from "@/components/comboboxes/types/combobox.types";

export type GroupedComboboxVariant =
  | "multipleGroupsWithLabels"
  | "categoriesWithSeparators"
  | "nestedHierarchicalGroups"
  | "groupsWithItemCounts"
  | "collapsibleGroups"
  | "recentVsAllItems"
  | "favoritesPlusAllItems";

export type GroupedComboboxProps = BaseComboboxProps &
  ComboboxSingleValueProps & {
    variant?: GroupedComboboxVariant;
    groups?: ComboboxGroupOption[];
    nestedGroups?: ComboboxNestedGroupOption[];
    recentGroupLabel?: string;
    allGroupLabel?: string;
    favoritesGroupLabel?: string;
    showCounts?: boolean;
  };
