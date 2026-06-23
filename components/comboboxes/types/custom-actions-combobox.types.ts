import type {
  BaseComboboxProps,
  ComboboxFilterOption,
  ComboboxFooterAction,
  ComboboxShortcutOption,
  ComboboxSingleValueProps,
} from "@/components/comboboxes/types/combobox.types";

export type CustomActionsComboboxVariant =
  | "createNewOptionInline"
  | "withFooterActions"
  | "recentSelectionsSection"
  | "asyncDynamicSearch"
  | "withQuickFilters"
  | "keyboardShortcutsDisplayed"
  | "clearResetButton";

export type CustomActionsComboboxProps = BaseComboboxProps &
  ComboboxSingleValueProps & {
    variant?: CustomActionsComboboxVariant;
    recentOptions?: string[];
    recentGroupLabel?: string;
    footerActions?: ComboboxFooterAction[];
    filters?: ComboboxFilterOption[];
    shortcuts?: ComboboxShortcutOption[];
    isLoading?: boolean;
    onCreate?: (search: string) => void;
    onSearch?: (search: string) => void;
    searchResults?: string[];
    showClear?: boolean;
    onClear?: () => void;
    createLabel?: string;
  };
