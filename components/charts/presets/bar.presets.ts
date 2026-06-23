import type { BarChartProps } from "@/components/charts/types";
import { formatDateTick, formatWeekdayTick } from "@/components/charts/utils/chart-data";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type BarPreset = Partial<
  Pick<
    BarChartProps,
    | "layout"
    | "stacked"
    | "radius"
    | "activeBar"
    | "negativeValues"
    | "showGrid"
    | "showLegend"
    | "tooltip"
    | "legend"
    | "label"
    | "xAxis"
    | "timeRange"
    | "margin"
  >
>;

/**
 * Kibo UI bar chart pattern presets.
 */
export const barPresets = {
  active: {
    activeBar: true,
    tooltip: tooltipPresets.labelNone,
  },
  default: {
    radius: 8,
    tooltip: tooltipPresets.labelNone,
  },
  horizontal: {
    layout: "vertical",
    radius: 5,
    margin: { left: -20 },
    tooltip: tooltipPresets.labelNone,
  },
  interactive: {
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
  labelCustom: {
    label: { position: "top" },
    tooltip: tooltipPresets.labelNone,
  },
  label: {
    label: { position: "top" },
    tooltip: tooltipPresets.labelNone,
  },
  mixed: {
    stacked: true,
    tooltip: tooltipPresets.default,
  },
  multiple: {
    tooltip: tooltipPresets.default,
  },
  negative: {
    negativeValues: true,
    tooltip: tooltipPresets.default,
  },
  stacked: {
    stacked: true,
    showLegend: true,
    tooltip: tooltipPresets.labelNone,
  },
  weekday: {
    stacked: true,
    xAxis: {
      tickFormatter: (value) => formatWeekdayTick(value),
    },
    tooltip: tooltipPresets.weekday,
  },
} as const satisfies Record<string, BarPreset>;
