import type { ReactNode } from "react";

import type {
  BaseChartProps,
  ChartLegendConfig,
  ChartTooltipConfig,
} from "@/components/charts/types/chart.types";

export type PieChartVariant = "pie" | "donut";
export type PieLabelMode = "none" | "default" | "custom" | "list";

export type PieChartLayer = {
  data: Record<string, unknown>[];
  dataKey: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
};

/**
 * Props for the universal PieChart component (pie + donut).
 * Covers all Kibo UI pie chart patterns.
 */
export type PieChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  variant?: PieChartVariant;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  label?: PieLabelMode;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  centerLabel?: ReactNode;
  /** Renders multiple concentric Pie layers (Kibo pie-stacked). */
  layers?: PieChartLayer[];
  separator?: boolean;
  paddingAngle?: number;
  tooltip?: ChartTooltipConfig;
  legend?: ChartLegendConfig;
};
