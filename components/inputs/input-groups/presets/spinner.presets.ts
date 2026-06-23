import type { SpinnerInputGroupProps } from "@/components/inputs/input-groups/types";

export const spinnerPresets = {
  loadingStates: {
    variant: "loadingStates",
    isLoading: true,
  },
  spinnerText: {
    variant: "spinnerText",
    loadingText: "Saving...",
    isLoading: true,
  },
  animatedIcon: {
    variant: "animatedIcon",
    isLoading: true,
  },
  textareaLoading: {
    variant: "textareaLoading",
    isLoading: true,
  },
} satisfies Record<string, Partial<SpinnerInputGroupProps>>;
