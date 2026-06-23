import { XAxis, YAxis } from "recharts";

import type { ChartAxisConfig } from "@/components/charts/types";
import { formatMonthTick } from "@/components/charts/utils/chart-data";

type CartesianAxisProps = {
  dataKey: string;
  axis?: ChartAxisConfig;
  layout?: "horizontal" | "vertical";
  role?: "x" | "y";
};

const DEFAULT_TICK_MARGIN = 8;

/**
 * Renders XAxis or YAxis with Kibo UI defaults.
 */
export function ChartCartesianAxis({
  dataKey,
  axis,
  layout = "horizontal",
  role = "x",
}: CartesianAxisProps) {
  const tickFormatter = axis?.tickFormatter ?? formatMonthTick;
  const tickMargin = axis?.tickMargin ?? DEFAULT_TICK_MARGIN;
  const isVerticalLayout = layout === "vertical";

  if (role === "x") {
    return (
      <XAxis
        dataKey={isVerticalLayout ? undefined : dataKey}
        type={isVerticalLayout ? "number" : (axis?.type ?? "category")}
        hide={axis?.hide ?? isVerticalLayout}
        tickLine={false}
        axisLine={false}
        tickMargin={tickMargin}
        minTickGap={axis?.minTickGap}
        tickFormatter={isVerticalLayout ? undefined : tickFormatter}
      />
    );
  }

  return (
    <YAxis
      dataKey={isVerticalLayout ? dataKey : undefined}
      type={isVerticalLayout ? "category" : (axis?.type ?? "number")}
      hide={axis?.hide}
      tickLine={false}
      axisLine={false}
      tickMargin={tickMargin}
      tickFormatter={isVerticalLayout ? tickFormatter : undefined}
    />
  );
}
