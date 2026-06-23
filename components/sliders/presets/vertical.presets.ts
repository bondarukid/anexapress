import type { VerticalSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI vertical slider pattern presets.
 */
export const verticalPresets = {
  volume: {
    variant: "volume",
    label: "Volume",
    defaultValue: [60],
  },
  height: {
    variant: "height",
    label: "Height (cm)",
    defaultValue: [170],
    min: 140,
    max: 200,
  },
  labels: {
    variant: "labels",
    label: "Level",
    defaultValue: [50],
    sideLabels: [100, 75, 50, 25, 0],
  },
  range: {
    variant: "range",
    label: "Range",
    defaultValue: [30, 70],
  },
  indicators: {
    variant: "indicators",
    label: "Intensity",
    defaultValue: [50],
    step: 25,
    indicatorLabels: ["Max", "High", "Med", "Low", "Min"],
  },
} satisfies Record<string, Partial<VerticalSliderProps>>;
