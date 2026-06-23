"use client";

import * as React from "react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList } from "recharts";

import type { BarChartProps } from "@/components/charts/types";
import { ChartCartesianAxis } from "@/components/charts/utils/chart-axes";
import { filterDataByTimeRange } from "@/components/charts/utils/chart-data";
import { RenderChartLegend } from "@/components/charts/utils/chart-legend";
import {
  resolveBarRadius,
  resolveStackId,
  resolveStackOffset,
} from "@/components/charts/utils/chart-stack";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Universal bar chart covering all Kibo UI bar patterns.
 */
export function BarChart({
  data,
  config,
  xKey,
  series,
  layout = "horizontal",
  stacked,
  radius,
  activeBar = false,
  negativeValues = false,
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
  margin,
}: BarChartProps) {
  const visibleSeries = series.filter((item) => !item.hide);
  const isVertical = layout === "vertical";

  const chartData = React.useMemo(() => {
    if (!timeRange) {
      return data;
    }
    return filterDataByTimeRange(data, timeRange);
  }, [data, timeRange]);

  const stackOffset = resolveStackOffset(stacked);
  const resolvedMargin = margin ?? (isVertical ? { left: -20 } : undefined);

  return (
    <ChartContainer config={config} className={cn(className)} id={id}>
      <RechartsBarChart
        accessibilityLayer={accessibilityLayer}
        data={chartData}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={resolvedMargin}
        stackOffset={stackOffset}
      >
        {showGrid && !isVertical ? <CartesianGrid vertical={false} /> : null}
        <ChartCartesianAxis
          dataKey={xKey}
          axis={xAxis}
          layout={layout}
          role="x"
        />
        <ChartCartesianAxis
          dataKey={xKey}
          axis={{
            ...yAxis,
            hide: negativeValues ? false : yAxis?.hide,
          }}
          layout={layout}
          role="y"
        />
        <RenderChartTooltip config={tooltip} />
        {showLegend ? <RenderChartLegend config={legend} /> : null}
        {visibleSeries.map((item, index) => (
          <Bar
            key={item.dataKey}
            dataKey={item.dataKey}
            fill={`var(--color-${item.dataKey})`}
            stackId={resolveStackId(item, stacked, index)}
            radius={
              item.radius ??
              resolveBarRadius(index, visibleSeries.length, radius, stacked)
            }
            activeBar={
              activeBar
                ? {
                    fill: `var(--color-${item.dataKey})`,
                    fillOpacity: 0.8,
                  }
                : undefined
            }
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
          </Bar>
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
