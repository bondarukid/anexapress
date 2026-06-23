import type {
  BaseChartProps,
  ChartLegendConfig,
  ChartSeries,
  ChartTooltipConfig,
} from "@/components/charts/types/chart.types";

export type RadarGridMode =
  | boolean
  | "circle"
  | "polygon"
  | "filled"
  | "custom"
  | "none";

/**
 * Props for the universal RadarChart component.
 * Covers all Kibo UI radar chart patterns.
 */
export type RadarChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  angleKey: string;
  series: ChartSeries[];
  grid?: RadarGridMode;
  showDots?: boolean;
  linesOnly?: boolean;
  fillOpacity?: number;
  showLegend?: boolean;
  radiusAxis?: boolean;
  tooltip?: ChartTooltipConfig;
  legend?: ChartLegendConfig;
};
