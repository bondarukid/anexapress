import type { InteractiveSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI interactive slider pattern presets.
 */
export const interactivePresets = {
  syncedInput: {
    variant: "syncedInput",
    label: "Value",
    max: 100,
  },
  incrementDecrement: {
    variant: "incrementDecrement",
    label: "Quantity",
    stepAmount: 10,
  },
  presets: {
    variant: "presets",
    label: "Level",
    presetValues: [0, 25, 50, 75, 100],
  },
  reset: {
    variant: "reset",
    label: "Adjustment",
    defaultValue: [50],
    resetValue: 50,
    resetLabel: "Reset",
  },
  livePreview: {
    variant: "livePreview",
    label: "Border Radius",
    max: 50,
    defaultValue: [50],
  },
} satisfies Record<string, Partial<InteractiveSliderProps>>;
