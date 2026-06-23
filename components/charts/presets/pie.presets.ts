import type { PieChartProps } from "@/components/charts/types";
import { tooltipPresets } from "@/components/charts/presets/tooltip.presets";

type PiePreset = Partial<
  Pick<
    PieChartProps,
    | "variant"
    | "innerRadius"
    | "outerRadius"
    | "showLegend"
    | "label"
    | "activeIndex"
    | "layers"
    | "separator"
    | "paddingAngle"
    | "tooltip"
    | "legend"
  >
>;

/**
 * Kibo UI pie chart pattern presets.
 */
export const piePresets = {
  donutActive: {
    variant: "donut",
    activeIndex: 0,
    tooltip: tooltipPresets.labelNone,
  },
  donutText: {
    variant: "donut",
    tooltip: tooltipPresets.labelNone,
  },
  donut: {
    variant: "donut",
    innerRadius: 60,
    tooltip: tooltipPresets.labelNone,
  },
  interactive: {
    activeIndex: 0,
    tooltip: tooltipPresets.labelNone,
  },
  labelCustom: {
    label: "custom",
    tooltip: tooltipPresets.default,
  },
  labelList: {
    label: "list",
    tooltip: tooltipPresets.default,
  },
  label: {
    label: "default",
    tooltip: tooltipPresets.default,
  },
  legend: {
    showLegend: true,
    legend: {
      nameKey: "browser",
      className: "-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center",
    },
  },
  separatorNone: {
    separator: false,
    paddingAngle: 0,
    tooltip: tooltipPresets.default,
  },
  simple: {
    tooltip: tooltipPresets.default,
  },
  stacked: {
    tooltip: {
      indicator: "line",
      labelKey: "visitors",
      nameKey: "month",
    },
  },
} as const satisfies Record<string, PiePreset>;
