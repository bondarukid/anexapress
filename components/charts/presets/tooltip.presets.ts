import type { ChartTooltipConfig } from "@/components/charts/types";
import { formatDateTick, formatWeekdayTick } from "@/components/charts/utils/chart-data";

/**
 * Kibo UI tooltip pattern presets.
 * Spread into any chart's `tooltip` prop.
 */
export const tooltipPresets = {
  default: {
    indicator: "dot",
  },
  advanced: {
    hideLabel: true,
    indicator: "dot",
    className: "w-[180px]",
  },
  formatter: {
    hideLabel: true,
    indicator: "dot",
  },
  icons: {
    indicator: "dot",
  },
  indicatorLine: {
    indicator: "line",
  },
  indicatorNone: {
    indicator: "none",
    hideIndicator: true,
  },
  labelCustom: {
    indicator: "dot",
  },
  labelFormatter: {
    labelFormatter: (value) =>
      typeof value === "string" || typeof value === "number"
        ? formatDateTick(String(value))
        : String(value),
    indicator: "dot",
  },
  labelNone: {
    hideLabel: true,
    indicator: "dot",
  },
  weekday: {
    labelFormatter: (value) =>
      typeof value === "string" || typeof value === "number"
        ? formatWeekdayTick(String(value))
        : String(value),
    indicator: "dot",
  },
} as const satisfies Record<string, ChartTooltipConfig>;
