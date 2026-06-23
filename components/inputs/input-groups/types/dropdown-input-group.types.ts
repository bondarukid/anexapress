import type {
  BaseInputGroupProps,
  InputGroupMenuItem,
  InputGroupMixedControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type DropdownInputGroupVariant =
  | "dropdownActions"
  | "searchFilters"
  | "urlBuilderDropdown"
  | "textareaDropdown";

export type DropdownInputGroupProps = BaseInputGroupProps &
  InputGroupMixedControlProps & {
    variant?: DropdownInputGroupVariant;
    menuItems?: InputGroupMenuItem[];
    prefixText?: string;
    filterOptions?: InputGroupMenuItem[];
    dropdownLabel?: string;
    textareaClassName?: string;
  };
