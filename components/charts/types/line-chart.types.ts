import type {
  BaseChartProps,
  ChartAxisConfig,
  ChartCurveType,
  ChartLabelConfig,
  ChartLegendConfig,
  ChartSeries,
  ChartTooltipConfig,
  LineDotConfig,
  TimeRangeFilter,
} from "@/components/charts/types/chart.types";

/**
 * Props for the universal LineChart component.
 * Covers all Kibo UI line chart patterns.
 */
export type LineChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  curve?: ChartCurveType;
  dots?: boolean | LineDotConfig;
  strokeWidth?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: ChartTooltipConfig;
  legend?: ChartLegendConfig;
  label?: ChartLabelConfig;
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  timeRange?: TimeRangeFilter;
};
