import type { DropdownInputGroupProps } from "@/components/inputs/input-groups/types";

export const dropdownPresets = {
  dropdownActions: {
    variant: "dropdownActions",
  },
  searchFilters: {
    variant: "searchFilters",
    dropdownLabel: "Category",
  },
  urlBuilderDropdown: {
    variant: "urlBuilderDropdown",
    prefixText: "https://",
  },
  textareaDropdown: {
    variant: "textareaDropdown",
  },
} satisfies Record<string, Partial<DropdownInputGroupProps>>;
