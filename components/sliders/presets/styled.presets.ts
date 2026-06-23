import type { StyledSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI styled slider pattern presets.
 */
export const styledPresets = {
  colored: {
    variant: "colored",
    label: "Success Rate",
    defaultValue: [60],
    colorScheme: "green",
  },
  tooltip: {
    variant: "tooltip",
    label: "Progress",
    defaultValue: [45],
  },
  large: {
    variant: "large",
    label: "Volume",
    defaultValue: [55],
  },
  minimal: {
    variant: "minimal",
    label: "Intensity",
    defaultValue: [40],
  },
  gradient: {
    variant: "gradient",
    label: "Heat",
    defaultValue: [70],
  },
} satisfies Record<string, Partial<StyledSliderProps>>;
