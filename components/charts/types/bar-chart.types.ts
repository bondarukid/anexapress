import type {
  BaseChartProps,
  ChartAxisConfig,
  ChartLabelConfig,
  ChartLayout,
  ChartLegendConfig,
  ChartSeries,
  ChartStackMode,
  ChartTooltipConfig,
  TimeRangeFilter,
} from "@/components/charts/types/chart.types";

/**
 * Props for the universal BarChart component.
 * Covers all Kibo UI bar chart patterns.
 */
export type BarChartProps = BaseChartProps & {
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeries[];
  layout?: ChartLayout;
  stacked?: ChartStackMode;
  radius?: number | [number, number, number, number];
  activeBar?: boolean;
  negativeValues?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: ChartTooltipConfig;
  legend?: ChartLegendConfig;
  label?: ChartLabelConfig;
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  timeRange?: TimeRangeFilter;
};
