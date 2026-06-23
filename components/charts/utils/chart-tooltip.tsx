import {
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartTooltipConfig } from "@/components/charts/types";

type RenderChartTooltipProps = {
  config?: ChartTooltipConfig;
};

/**
 * Maps ChartTooltipConfig to shadcn ChartTooltip + ChartTooltipContent.
 */
export function RenderChartTooltip({ config }: RenderChartTooltipProps) {
  if (!config) {
    return (
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="dot" />}
      />
    );
  }

  const indicator =
    config.indicator === "none" ? undefined : (config.indicator ?? "dot");

  return (
    <ChartTooltip
      cursor={config.cursor ?? false}
      defaultIndex={config.defaultIndex}
      content={
        <ChartTooltipContent
          className={config.className}
          hideLabel={config.hideLabel}
          hideIndicator={config.hideIndicator ?? config.indicator === "none"}
          indicator={indicator}
          labelFormatter={config.labelFormatter}
          formatter={config.formatter}
          nameKey={config.nameKey}
          labelKey={config.labelKey}
        />
      }
    />
  );
}
