import type { CustomActionsComboboxProps } from "@/components/comboboxes/types";

export const customActionsPresets = {
  createNewOptionInline: {
    variant: "createNewOptionInline",
  },
  withFooterActions: {
    variant: "withFooterActions",
    defaultValue: "personal",
  },
  recentSelectionsSection: {
    variant: "recentSelectionsSection",
  },
  asyncDynamicSearch: {
    variant: "asyncDynamicSearch",
  },
  withQuickFilters: {
    variant: "withQuickFilters",
  },
  keyboardShortcutsDisplayed: {
    variant: "keyboardShortcutsDisplayed",
  },
  clearResetButton: {
    variant: "clearResetButton",
    defaultValue: "system",
  },
} satisfies Record<string, Partial<CustomActionsComboboxProps>>;
