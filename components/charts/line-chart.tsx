"use client";

import * as React from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart as RechartsLineChart,
} from "recharts";

import type { LineChartProps } from "@/components/charts/types";
import { ChartCartesianAxis } from "@/components/charts/utils/chart-axes";
import { filterDataByTimeRange } from "@/components/charts/utils/chart-data";
import { RenderChartLegend } from "@/components/charts/utils/chart-legend";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Universal line chart covering all Kibo UI line patterns.
 */
export function LineChart({
  data,
  config,
  xKey,
  series,
  curve = "natural",
  dots = false,
  strokeWidth = 2,
  showGrid = true,
  showLegend = false,
  tooltip,
  legend,
  label,
  xAxis,
  yAxis,
  timeRange,
  className,
  id,
  accessibilityLayer = true,
  margin = { left: 12, right: 12 },
}: LineChartProps) {
  const visibleSeries = series.filter((item) => !item.hide);

  const chartData = React.useMemo(() => {
    if (!timeRange) {
      return data;
    }
    return filterDataByTimeRange(data, timeRange);
  }, [data, timeRange]);

  return (
    <ChartContainer config={config} className={cn(className)} id={id}>
      <RechartsLineChart
        accessibilityLayer={accessibilityLayer}
        data={chartData}
        margin={margin}
      >
        {showGrid ? <CartesianGrid vertical={false} /> : null}
        <ChartCartesianAxis dataKey={xKey} axis={xAxis} role="x" />
        {yAxis ? <ChartCartesianAxis dataKey={xKey} axis={yAxis} role="y" /> : null}
        <RenderChartTooltip config={tooltip} />
        {visibleSeries.map((item) => {
          const dotConfig =
            typeof dots === "object"
              ? {
                  r: dots.r ?? 4,
                  fill: dots.fill ?? `var(--color-${item.dataKey})`,
                  strokeWidth: dots.strokeWidth,
                }
              : dots
                ? {
                    fill: `var(--color-${item.dataKey})`,
                  }
                : false;

          return (
            <Line
              key={item.dataKey}
              dataKey={item.dataKey}
              type={curve}
              stroke={`var(--color-${item.dataKey})`}
              strokeWidth={item.strokeWidth ?? strokeWidth}
              dot={dotConfig}
              activeDot={dots ? { r: 6 } : undefined}
            >
              {label ? (
                <LabelList
                  position={label.position ?? "top"}
                  className={label.className}
                  formatter={
                    label.formatter
                      ? (value) => label.formatter?.(Number(value))
                      : undefined
                  }
                />
              ) : null}
            </Line>
          );
        })}
        {showLegend ? <RenderChartLegend config={legend} /> : null}
      </RechartsLineChart>
    </ChartContainer>
  );
}
