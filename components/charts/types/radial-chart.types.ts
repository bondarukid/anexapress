import type { ReactNode } from "react";

import type {
  BaseChartProps,
  ChartLabelConfig,
  ChartTooltipConfig,
} from "@/components/charts/types/chart.types";

/**
 * Props for the universal RadialChart component.
 * Covers all Kibo UI radial chart patterns.
 */
export type RadialChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  background?: boolean;
  grid?: boolean;
  label?: ChartLabelConfig;
  centerText?: ReactNode;
  stacked?: boolean;
  customShape?: boolean;
  tooltip?: ChartTooltipConfig;
};
