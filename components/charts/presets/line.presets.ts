import type { LineChartProps } from "@/components/charts/types";
import { formatDateTick } from "@/components/charts/utils/chart-data";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type LinePreset = Partial<
  Pick<
    LineChartProps,
    | "curve"
    | "dots"
    | "strokeWidth"
    | "showGrid"
    | "showLegend"
    | "tooltip"
    | "legend"
    | "label"
    | "xAxis"
    | "timeRange"
  >
>;

/**
 * Kibo UI line chart pattern presets.
 */
export const linePresets = {
  default: {
    tooltip: tooltipPresets.default,
  },
  dotsColors: {
    dots: true,
    strokeWidth: 2,
    tooltip: tooltipPresets.labelNone,
  },
  dotsCustom: {
    dots: { r: 6, strokeWidth: 2 },
    strokeWidth: 2,
    tooltip: tooltipPresets.labelNone,
  },
  dots: {
    dots: true,
    strokeWidth: 2,
    tooltip: tooltipPresets.labelNone,
  },
  interactive: {
    dots: true,
    tooltip: {
      indicator: "dot",
      labelFormatter: (value) =>
        typeof value === "string" || typeof value === "number"
          ? formatDateTick(String(value))
          : String(value),
    },
    xAxis: {
      minTickGap: 32,
      tickFormatter: (value) => formatDateTick(value),
    },
    timeRange: {
      key: "date",
      default: "90d",
      referenceDate: "2024-06-30",
      options: ["7d", "30d", "90d"],
    },
  },
  labelCustom: {
    label: { position: "top" },
    tooltip: tooltipPresets.default,
  },
  label: {
    label: { position: "top" },
    tooltip: tooltipPresets.default,
  },
  linear: {
    curve: "linear",
    tooltip: tooltipPresets.default,
  },
  multiple: {
    dots: true,
    strokeWidth: 2,
    tooltip: tooltipPresets.labelNone,
  },
  step: {
    curve: "step",
    tooltip: tooltipPresets.default,
  },
} as const satisfies Record<string, LinePreset>;
