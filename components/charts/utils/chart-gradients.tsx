import type { ChartSeries } from "@/components/charts/types";

type ChartGradientDefsProps = {
  series: ChartSeries[];
  prefix?: string;
};

/**
 * Renders linearGradient defs for area/line series fills.
 */
export function ChartGradientDefs({ series, prefix = "fill" }: ChartGradientDefsProps) {
  return (
    <defs>
      {series
        .filter((item) => !item.hide)
        .map((item) => (
          <linearGradient
            key={item.dataKey}
            id={`${prefix}${item.dataKey}`}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="5%" stopColor={`var(--color-${item.dataKey})`} stopOpacity={0.8} />
            <stop offset="95%" stopColor={`var(--color-${item.dataKey})`} stopOpacity={0.1} />
          </linearGradient>
        ))}
    </defs>
  );
}

/**
 * Resolves fill color for a series — gradient URL or CSS variable.
 */
export function getSeriesFill(dataKey: string, gradient: boolean, prefix = "fill"): string {
  return gradient ? `url(#${prefix}${dataKey})` : `var(--color-${dataKey})`;
}
