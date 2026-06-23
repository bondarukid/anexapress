import type {
  BaseChartProps,
  ChartAxisConfig,
  ChartCurveType,
  ChartLegendConfig,
  ChartSeries,
  ChartStackMode,
  ChartTooltipConfig,
  TimeRangeFilter,
} from "@/components/charts/types/chart.types";

/**
 * Props for the universal AreaChart component.
 * Covers all Kibo UI area chart patterns.
 */
export type AreaChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  curve?: ChartCurveType;
  stacked?: ChartStackMode;
  gradient?: boolean;
  fillOpacity?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: ChartTooltipConfig;
  legend?: ChartLegendConfig;
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  timeRange?: TimeRangeFilter;
};
