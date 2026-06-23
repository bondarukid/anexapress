import type { RangeSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI range slider pattern presets.
 */
export const rangePresets = {
  basic: {
    variant: "basic",
    label: "Select Range",
    defaultValue: [25, 75],
  },
  price: {
    variant: "price",
    label: "Price Range",
    defaultValue: [200, 800],
    max: 1000,
  },
  valueDisplay: {
    variant: "valueDisplay",
    label: "Range",
    defaultValue: [30, 70],
  },
  constrained: {
    variant: "constrained",
    label: "Constrained Range",
    defaultValue: [20, 60],
    minGap: 10,
    constraintHint: "Minimum gap: 10",
  },
  percentage: {
    variant: "percentage",
    label: "Percentage Range",
    defaultValue: [10, 90],
  },
} satisfies Record<string, Partial<RangeSliderProps>>;
