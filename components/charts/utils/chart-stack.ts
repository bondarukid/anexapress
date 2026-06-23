import type { ChartSeries, ChartStackMode } from "@/components/charts/types";

const DEFAULT_STACK_ID = "a";

/**
 * Resolves stackId for a series based on stacked mode.
 */
export function resolveStackId(
  series: ChartSeries,
  stacked: ChartStackMode | undefined,
  _index: number,
): string | undefined {
  if (!stacked) {
    return series.stackId;
  }
  return series.stackId ?? DEFAULT_STACK_ID;
}

/**
 * Resolves stackOffset for expand stacking (Kibo stacked-expand).
 */
export function resolveStackOffset(
  stacked: ChartStackMode | undefined,
): "expand" | undefined {
  return stacked === "expand" ? "expand" : undefined;
}

/**
 * Computes bar radius for stacked series (top bar gets top radius).
 */
export function resolveBarRadius(
  index: number,
  total: number,
  radius: number | [number, number, number, number] | undefined,
  stacked: ChartStackMode | undefined,
): number | [number, number, number, number] | undefined {
  if (!stacked || typeof radius === "number") {
    return radius ?? seriesDefaultRadius(index, total, stacked);
  }
  return radius;
}

function seriesDefaultRadius(
  index: number,
  total: number,
  stacked: ChartStackMode | undefined,
): number | [number, number, number, number] | undefined {
  if (!stacked) {
    return 8;
  }
  if (index === 0) {
    return [0, 0, 4, 4];
  }
  if (index === total - 1) {
    return [4, 4, 0, 0];
  }
  return 0;
}
