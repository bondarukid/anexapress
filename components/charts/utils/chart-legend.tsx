import { ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartLegendConfig } from "@/components/charts/types";

type RenderChartLegendProps = {
  config?: ChartLegendConfig;
};

/**
 * Maps ChartLegendConfig to shadcn ChartLegend + ChartLegendContent.
 */
export function RenderChartLegend({ config }: RenderChartLegendProps) {
  return (
    <ChartLegend
      className={config?.className}
      content={
        <ChartLegendContent
          hideIcon={config?.hideIcon}
          nameKey={config?.nameKey}
          verticalAlign={config?.verticalAlign}
        />
      }
    />
  );
}
