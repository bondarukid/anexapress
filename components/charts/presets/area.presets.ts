import type { AreaChartProps } from "@/components/charts/types";
import { formatDateTick } from "@/components/charts/utils/chart-data";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type AreaPreset = Partial<
  Pick<
    AreaChartProps,
    | "curve"
    | "stacked"
    | "gradient"
    | "fillOpacity"
    | "showGrid"
    | "showLegend"
    | "tooltip"
    | "legend"
    | "xAxis"
    | "yAxis"
    | "timeRange"
    | "margin"
  >
>;

/**
 * Kibo UI area chart pattern presets.
 */
export const areaPresets = {
  axes: {
    yAxis: { hide: false },
    tooltip: tooltipPresets.indicatorLine,
  },
  default: {
    fillOpacity: 0.4,
    tooltip: tooltipPresets.indicatorLine,
  },
  gradient: {
    gradient: true,
    stacked: true,
    fillOpacity: 0.4,
    tooltip: tooltipPresets.default,
  },
  icons: {
    fillOpacity: 0.4,
    tooltip: tooltipPresets.labelNone,
  },
  interactive: {
    gradient: true,
    stacked: true,
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
  legend: {
    stacked: true,
    showLegend: true,
    tooltip: tooltipPresets.indicatorLine,
  },
  linear: {
    curve: "linear",
    fillOpacity: 0.4,
    tooltip: tooltipPresets.default,
  },
  stackedExpand: {
    stacked: "expand",
    fillOpacity: 0.4,
    margin: { left: 12, right: 12, top: 12 },
    tooltip: tooltipPresets.indicatorLine,
  },
  stacked: {
    stacked: true,
    fillOpacity: 0.4,
    tooltip: tooltipPresets.default,
  },
  step: {
    curve: "step",
    fillOpacity: 0.4,
    tooltip: tooltipPresets.labelNone,
  },
} as const satisfies Record<string, AreaPreset>;
