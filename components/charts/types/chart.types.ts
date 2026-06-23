import type { TooltipValueType } from "recharts";
import type { DefaultTooltipContentProps } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

type TooltipNameType = number | string;

export type ChartCurveType = "natural" | "linear" | "step";
export type ChartStackMode = boolean | "expand";
export type ChartLayout = "horizontal" | "vertical";
export type ChartTooltipIndicator = "dot" | "line" | "dashed" | "none";
export type TimeRangeOption = "7d" | "30d" | "90d";

export type ChartSeries = {
  dataKey: string;
  stackId?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  radius?: number | [number, number, number, number];
  hide?: boolean;
};

export type ChartAxisConfig = {
  hide?: boolean;
  tickFormatter?: (value: string) => string;
  tickMargin?: number;
  minTickGap?: number;
  type?: "number" | "category";
};

export type ChartTooltipFormatter = NonNullable<
  DefaultTooltipContentProps<TooltipValueType, TooltipNameType>["formatter"]
>;

/**
 * Shared tooltip configuration mapped to ChartTooltipContent.
 * Covers all Kibo UI tooltip patterns.
 */
export type ChartTooltipConfig = {
  indicator?: ChartTooltipIndicator;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: DefaultTooltipContentProps<
    TooltipValueType,
    TooltipNameType
  >["labelFormatter"];
  formatter?: ChartTooltipFormatter;
  defaultIndex?: number;
  cursor?: boolean;
  className?: string;
  nameKey?: string;
  labelKey?: string;
};

export type ChartLegendConfig = {
  hideIcon?: boolean;
  nameKey?: string;
  verticalAlign?: "top" | "bottom";
  className?: string;
};

export type ChartLabelConfig = {
  position?: "top" | "center" | "bottom" | "inside" | "outside";
  formatter?: (value: number | string | undefined) => string;
  className?: string;
};

export type LineDotConfig = {
  r?: number;
  fill?: string;
  strokeWidth?: number;
};

export type TimeRangeFilter = {
  key: string;
  default?: TimeRangeOption;
  value?: TimeRangeOption;
  referenceDate?: string;
  options?: TimeRangeOption[];
};

export type BaseChartProps = {
  config: ChartConfig;
  className?: string;
  id?: string;
  accessibilityLayer?: boolean;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
};
