"use client";

import * as React from "react";
import { Label, Pie, PieChart as RechartsPieChart, Sector } from "recharts";

import type { PieChartLayer, PieChartProps } from "@/components/charts/types";
import { RenderChartLegend } from "@/components/charts/utils/chart-legend";
import { RenderChartTooltip } from "@/components/charts/utils/chart-tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const DEFAULT_INNER_RADIUS = 60;

type PieSectorProps = {
  outerRadius?: number;
  cx?: number;
  cy?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
};

type PieRootProps = {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  label?: boolean;
  activeIndex?: number;
  activeShape?: (props: PieSectorProps) => React.ReactElement;
  onMouseEnter?: (item: unknown, index: number) => void;
  children?: React.ReactNode;
};

const PieRoot = Pie as React.ComponentType<PieRootProps>;

function renderPieLayer(
  layer: PieChartLayer,
  options: {
    nameKey?: string;
    paddingAngle: number;
    label: boolean;
    activeIndex?: number;
    activeShape?: (props: PieSectorProps) => React.ReactElement;
    onMouseEnter?: (item: unknown, index: number) => void;
    centerLabel?: React.ReactNode;
    isPrimary?: boolean;
  },
) {
  const interactiveProps =
    options.activeIndex !== undefined
      ? {
          activeIndex: options.activeIndex,
          activeShape: options.activeShape,
        }
      : {};

  return (
    <PieRoot
      key={layer.dataKey}
      data={layer.data}
      dataKey={layer.dataKey}
      nameKey={options.nameKey}
      innerRadius={layer.innerRadius}
      outerRadius={layer.outerRadius}
      paddingAngle={options.paddingAngle}
      onMouseEnter={options.onMouseEnter}
      label={options.label}
      {...interactiveProps}
    >
      {options.isPrimary && options.centerLabel ? (
        <Label
          content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              if (
                typeof options.centerLabel === "string" ||
                typeof options.centerLabel === "number"
              ) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {options.centerLabel}
                  </text>
                );
              }
            }
            return null;
          }}
        />
      ) : null}
    </PieRoot>
  );
}

/**
 * Universal pie/donut chart covering all Kibo UI pie patterns.
 */
export function PieChart({
  data,
  config,
  dataKey,
  nameKey,
  variant = "pie",
  innerRadius,
  outerRadius,
  showLegend = false,
  label = "none",
  activeIndex,
  onActiveIndexChange,
  centerLabel,
  layers,
  separator = false,
  paddingAngle,
  tooltip,
  legend,
  className,
  id,
}: PieChartProps) {
  const resolvedInnerRadius =
    innerRadius ?? (variant === "donut" ? DEFAULT_INNER_RADIUS : 0);
  const resolvedPaddingAngle = paddingAngle ?? (separator ? 2 : 0);

  const activeShape = React.useCallback(
    (props: PieSectorProps) => (
      <Sector {...props} outerRadius={(props.outerRadius ?? 0) + 10} />
    ),
    [],
  );

  const pieLayers: PieChartLayer[] =
    layers ??
    [
      {
        data,
        dataKey,
        innerRadius: resolvedInnerRadius,
        outerRadius,
      },
    ];

  const sharedOptions = {
    nameKey,
    paddingAngle: resolvedPaddingAngle,
    label: label === "default",
    activeIndex,
    activeShape,
    onMouseEnter: onActiveIndexChange
      ? (_: unknown, index: number) => onActiveIndexChange(index)
      : undefined,
    centerLabel,
  };

  return (
    <ChartContainer
      config={config}
      className={cn("mx-auto aspect-square max-h-[300px]", className)}
      id={id}
    >
      <RechartsPieChart>
        <RenderChartTooltip config={tooltip} />
        {pieLayers.map((layer, index) =>
          renderPieLayer(layer, {
            ...sharedOptions,
            isPrimary: index === 0,
          }),
        )}
        {showLegend ? (
          <RenderChartLegend
            config={{
              nameKey,
              className:
                legend?.className ??
                "-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center",
              ...legend,
            }}
          />
        ) : null}
      </RechartsPieChart>
    </ChartContainer>
  );
}
