"use client";

import { PolarGrid, RadialBar, RadialBarChart } from "recharts";

import type { RadialChartProps } from "@/components/charts/types";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Universal radial chart covering all Kibo UI radial patterns.
 */
export function RadialChart({
  data,
  config,
  dataKey,
  nameKey,
  innerRadius = 30,
  outerRadius = 110,
  background = false,
  grid = false,
  stacked = false,
  tooltip,
  className,
  id,
}: RadialChartProps) {
  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-square max-h-[250px]", className)}
      id={id}
    >
      <RadialBarChart
        data={data}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
      >
        {grid ? <PolarGrid /> : null}
        <RenderChartTooltip
          config={{
            hideLabel: true,
            nameKey,
            ...tooltip,
          }}
        />
        <RadialBar
          background={background}
          dataKey={dataKey}
          stackId={stacked ? "a" : undefined}
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
