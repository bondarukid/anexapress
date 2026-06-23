import type { WithStatesComboboxProps } from "@/components/comboboxes/types";

export const withStatesPresets = {
  loadingState: {
    variant: "loadingState",
  },
  errorStateWithRetry: {
    variant: "errorStateWithRetry",
  },
  emptyStateWithAction: {
    variant: "emptyStateWithAction",
  },
  noResultsVariation: {
    variant: "noResultsVariation",
  },
  withValidationFeedback: {
    variant: "withValidationFeedback",
  },
  withDisabledItems: {
    variant: "withDisabledItems",
  },
  readOnlyViewMode: {
    variant: "readOnlyViewMode",
    defaultValue: "basic",
    readOnly: true,
  },
} satisfies Record<string, Partial<WithStatesComboboxProps>>;
