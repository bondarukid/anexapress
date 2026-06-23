import type { GroupedComboboxProps } from "@/components/comboboxes/types";

export const groupedPresets = {
  multipleGroupsWithLabels: {
    variant: "multipleGroupsWithLabels",
  },
  categoriesWithSeparators: {
    variant: "categoriesWithSeparators",
  },
  nestedHierarchicalGroups: {
    variant: "nestedHierarchicalGroups",
  },
  groupsWithItemCounts: {
    variant: "groupsWithItemCounts",
    showCounts: true,
  },
  collapsibleGroups: {
    variant: "collapsibleGroups",
  },
  recentVsAllItems: {
    variant: "recentVsAllItems",
  },
  favoritesPlusAllItems: {
    variant: "favoritesPlusAllItems",
  },
} satisfies Record<string, Partial<GroupedComboboxProps>>;
