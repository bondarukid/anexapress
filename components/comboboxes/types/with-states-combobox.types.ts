import type {
  BaseComboboxProps,
  ComboboxSingleValueProps,
} from "@/components/comboboxes/types/combobox.types";

export type WithStatesComboboxVariant =
  | "loadingState"
  | "errorStateWithRetry"
  | "emptyStateWithAction"
  | "noResultsVariation"
  | "withValidationFeedback"
  | "withDisabledItems"
  | "readOnlyViewMode";

export type WithStatesComboboxProps = BaseComboboxProps &
  ComboboxSingleValueProps & {
    variant?: WithStatesComboboxVariant;
    isLoading?: boolean;
    error?: string;
    errorDescription?: string;
    onRetry?: () => void;
    retryLabel?: string;
    validationMessage?: string;
    readOnly?: boolean;
    emptyActionLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    onEmptyAction?: () => void;
    emptyItems?: string[];
    noResultsHint?: string;
  };
