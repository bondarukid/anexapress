import type { RadialChartProps } from "@/components/charts/types";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type RadialPreset = Partial<
  Pick<
    RadialChartProps,
    | "innerRadius"
    | "outerRadius"
    | "background"
    | "grid"
    | "stacked"
    | "customShape"
    | "tooltip"
  >
>;

/**
 * Kibo UI radial chart pattern presets.
 */
export const radialPresets = {
  grid: {
    grid: true,
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
  label: {
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
  shape: {
    customShape: true,
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
  simple: {
    innerRadius: 30,
    outerRadius: 110,
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
  stacked: {
    stacked: true,
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
  text: {
    background: true,
    tooltip: tooltipPresets.labelNone,
  },
} as const satisfies Record<string, RadialPreset>;
