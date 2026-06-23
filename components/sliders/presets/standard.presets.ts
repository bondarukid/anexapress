import type { StandardSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI standard slider pattern presets.
 */
export const standardPresets = {
  simple: {
    variant: "simple",
    defaultValue: [50],
  },
  label: {
    variant: "label",
    label: "Volume",
    defaultValue: [30],
  },
  valueDisplay: {
    variant: "valueDisplay",
    label: "Quality",
    defaultValue: [65],
  },
  minMaxLabels: {
    variant: "minMaxLabels",
    label: "Size",
    defaultValue: [50],
  },
  stepIndicators: {
    variant: "stepIndicators",
    label: "Level",
    defaultValue: [50],
    stepIndicatorValues: [0, 25, 50, 75, 100],
  },
} satisfies Record<string, Partial<StandardSliderProps>>;
