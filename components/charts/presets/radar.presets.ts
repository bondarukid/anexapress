import type { RadarChartProps } from "@/components/charts/types";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type RadarPreset = Partial<
  Pick<
    RadarChartProps,
    | "grid"
    | "showDots"
    | "linesOnly"
    | "fillOpacity"
    | "showLegend"
    | "radiusAxis"
    | "tooltip"
    | "legend"
  >
>;

/**
 * Kibo UI radar chart pattern presets.
 */
export const radarPresets = {
  default: {
    grid: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  dots: {
    grid: true,
    showDots: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  gridCircleFill: {
    grid: "filled",
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  gridCircleNoLines: {
    grid: "circle",
    linesOnly: true,
    tooltip: tooltipPresets.default,
  },
  gridCircle: {
    grid: "circle",
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  gridCustom: {
    grid: "custom",
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  gridFill: {
    grid: "filled",
    fillOpacity: 0.8,
    tooltip: tooltipPresets.default,
  },
  gridNone: {
    grid: "none",
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  icons: {
    grid: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.icons,
  },
  labelCustom: {
    grid: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.labelCustom,
  },
  legend: {
    grid: true,
    showLegend: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
  linesOnly: {
    grid: true,
    linesOnly: true,
    tooltip: tooltipPresets.default,
  },
  multiple: {
    grid: true,
    fillOpacity: 0.4,
    tooltip: tooltipPresets.default,
  },
  radius: {
    grid: true,
    radiusAxis: true,
    fillOpacity: 0.6,
    tooltip: tooltipPresets.default,
  },
} as const satisfies Record<string, RadarPreset>;
