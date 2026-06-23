"use client";

import { CalendarDays } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { FileManagerMonthlyTransfer } from "@/types/site-file-manager";

import { CATEGORY_META, CHART_CATEGORY_ORDER } from "./file-manager-utils";

const chartConfig = {
  documents: {
    label: CATEGORY_META.documents.label,
    color: CATEGORY_META.documents.chartBarColor,
  },
  images: {
    label: CATEGORY_META.images.label,
    color: CATEGORY_META.images.chartBarColor,
  },
  videos: {
    label: CATEGORY_META.videos.label,
    color: CATEGORY_META.videos.chartBarColor,
  },
  others: {
    label: CATEGORY_META.others.label,
    color: CATEGORY_META.others.chartBarColor,
  },
} satisfies ChartConfig;

type FileManagerTransferChartProps = {
  monthlyTransfers: FileManagerMonthlyTransfer[];
  dateRangeLabel: string;
};

function formatFileCount(value: number): string {
  return value === 1 ? "1 file" : `${value} files`;
}

/**
 * Stacked monthly upload chart grouped by file category.
 */
export function FileManagerTransferChart({
  monthlyTransfers,
  dateRangeLabel,
}: FileManagerTransferChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Monthly File Transfer</CardTitle>
          <CardDescription>Last 28 days</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-2">
          <CalendarDays className="size-4" />
          {dateRangeLabel}
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/7] w-full">
          <BarChart
            data={monthlyTransfers}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatFileCount(Number(value))}
                />
              }
            />
            {CHART_CATEGORY_ORDER.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="transfer"
                fill={`var(--color-${category})`}
                radius={
                  index === CHART_CATEGORY_ORDER.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          {CHART_CATEGORY_ORDER.map((category) => (
            <span key={category} className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_META[category].chartBarColor }}
              />
              {CATEGORY_META[category].label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
