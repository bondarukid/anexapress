"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
} from "recharts";

import type { RadarChartProps } from "@/components/charts/types";
import { RenderChartLegend } from "@/components/charts/utils/chart-legend";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Universal radar chart covering all Kibo UI radar patterns.
 */
export function RadarChart({
  data,
  config,
  angleKey,
  series,
  grid = true,
  showDots = false,
  linesOnly = false,
  fillOpacity = 0.6,
  showLegend = false,
  radiusAxis = false,
  tooltip,
  legend,
  className,
  id,
}: RadarChartProps) {
  const visibleSeries = series.filter((item) => !item.hide);
  const showGrid = grid !== false && grid !== "none";

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-square max-h-[250px]", className)}
      id={id}
    >
      <RechartsRadarChart data={data}>
        <RenderChartTooltip config={tooltip} />
        <PolarAngleAxis dataKey={angleKey} />
        {showGrid ? (
          <PolarGrid
            gridType={
              grid === "circle" || grid === "filled" ? "circle" : "polygon"
            }
          />
        ) : null}
        {radiusAxis ? <PolarRadiusAxis /> : null}
        {visibleSeries.map((item) => (
          <Radar
            key={item.dataKey}
            dataKey={item.dataKey}
            fill={linesOnly ? "none" : `var(--color-${item.dataKey})`}
            fillOpacity={linesOnly ? 0 : (item.fillOpacity ?? fillOpacity)}
            stroke={`var(--color-${item.dataKey})`}
            dot={showDots}
          />
        ))}
        {showLegend ? <RenderChartLegend config={legend} /> : null}
      </RechartsRadarChart>
    </ChartContainer>
  );
}
