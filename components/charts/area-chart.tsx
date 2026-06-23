"use client";

import * as React from "react";
import { Area, AreaChart as RechartsAreaChart, CartesianGrid } from "recharts";

import type { AreaChartProps } from "@/components/charts/types";
import { ChartCartesianAxis } from "@/components/charts/utils/chart-axes";
import { filterDataByTimeRange } from "@/components/charts/utils/chart-data";
import {
  ChartGradientDefs,
  getSeriesFill,
} from "@/components/charts/utils/chart-gradients";
import { RenderChartLegend } from "@/components/charts/utils/chart-legend";
import {
  resolveStackId,
  resolveStackOffset,
} from "@/components/charts/utils/chart-stack";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Universal area chart covering all Kibo UI area patterns.
 */
export function AreaChart({
  data,
  config,
  xKey,
  series,
  curve = "natural",
  stacked,
  gradient = false,
  fillOpacity = 0.4,
  showGrid = true,
  showLegend = false,
  tooltip,
  legend,
  xAxis,
  yAxis,
  timeRange,
  className,
  id,
  accessibilityLayer = true,
  margin = { left: 12, right: 12 },
}: AreaChartProps) {
  const visibleSeries = series.filter((item) => !item.hide);

  const chartData = React.useMemo(() => {
    if (!timeRange) {
      return data;
    }
    return filterDataByTimeRange(data, timeRange);
  }, [data, timeRange]);

  const stackOffset = resolveStackOffset(stacked);

  return (
    <ChartContainer config={config} className={cn(className)} id={id}>
      <RechartsAreaChart
        accessibilityLayer={accessibilityLayer}
        data={chartData}
        margin={margin}
        stackOffset={stackOffset}
      >
        {gradient ? <ChartGradientDefs series={visibleSeries} /> : null}
        {showGrid ? <CartesianGrid vertical={false} /> : null}
        <ChartCartesianAxis dataKey={xKey} axis={xAxis} role="x" />
        {yAxis ? <ChartCartesianAxis dataKey={xKey} axis={yAxis} role="y" /> : null}
        <RenderChartTooltip config={tooltip} />
        {visibleSeries.map((item, index) => (
          <Area
            key={item.dataKey}
            dataKey={item.dataKey}
            type={curve}
            fill={getSeriesFill(item.dataKey, gradient)}
            fillOpacity={item.fillOpacity ?? fillOpacity}
            stroke={`var(--color-${item.dataKey})`}
            stackId={resolveStackId(item, stacked, index)}
          />
        ))}
        {showLegend ? <RenderChartLegend config={legend} /> : null}
      </RechartsAreaChart>
    </ChartContainer>
  );
}
