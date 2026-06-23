"use client";

import { TrendingDown, TrendingUp, Users } from "lucide-react";

import type { StatsHoverCardProps } from "@/components/hover-cards/types";
import {
  formatCurrency,
  formatStatValue,
} from "@/components/hover-cards/utils/format-stat-value";
import { HoverCardStatGrid } from "@/components/hover-cards/utils/hover-card-layout";
import { HoverCardShell } from "@/components/hover-cards/utils/hover-card-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Stats hover card covering Kibo UI stats patterns.
 * https://www.kibo-ui.com/patterns/hover-card/stats
 */
export function StatsHoverCard({
  variant = "simpleStats",
  trigger,
  primaryLabel,
  primaryValue,
  icon: Icon = Users,
  statItems = [],
  performanceItems = [],
  trend,
  trendDirection = "up",
  currency = "USD",
  breakdown = [],
  contentClassName,
  ...shellProps
}: StatsHoverCardProps) {
  const resolvedContentClassName = cn(
    (variant === "userStats" || variant === "performanceStats" || variant === "financialStats") &&
      "w-72",
    contentClassName,
  );

  const formattedPrimary =
    typeof primaryValue === "number"
      ? variant === "financialStats"
        ? formatCurrency(primaryValue, currency)
        : formatStatValue(primaryValue)
      : primaryValue;

  const trendBadgeVariant =
    trendDirection === "up"
      ? "secondary"
      : trendDirection === "down"
        ? "destructive"
        : "outline";

  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  const content = (() => {
    switch (variant) {
      case "simpleStats":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon className="text-muted-foreground size-4" />
              <div className="flex flex-col">
                {primaryLabel ? (
                  <span className="text-muted-foreground text-xs">{primaryLabel}</span>
                ) : null}
                {formattedPrimary ? (
                  <span className="text-2xl font-semibold tabular-nums">{formattedPrimary}</span>
                ) : null}
              </div>
            </div>
            {breakdown.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {breakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium tabular-nums">
                      {typeof item.value === "number" ? formatStatValue(item.value) : item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );

      case "growthStats":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {primaryLabel ? (
                <span className="text-muted-foreground text-xs">{primaryLabel}</span>
              ) : null}
              {trend ? (
                <Badge variant={trendBadgeVariant} className="gap-1">
                  <TrendIcon className="size-3" />
                  {trend}
                </Badge>
              ) : null}
            </div>
            {formattedPrimary ? (
              <span className="text-2xl font-semibold tabular-nums">{formattedPrimary}</span>
            ) : null}
            {statItems.length > 0 ? <HoverCardStatGrid items={statItems} columns={2} /> : null}
          </div>
        );

      case "userStats":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {primaryLabel ? (
                <span className="text-muted-foreground text-xs">{primaryLabel}</span>
              ) : null}
              {formattedPrimary ? (
                <span className="text-2xl font-semibold tabular-nums">{formattedPrimary}</span>
              ) : null}
            </div>
            {statItems.length > 0 ? (
              <>
                <Separator />
                <HoverCardStatGrid items={statItems} columns={2} formatValues />
              </>
            ) : null}
          </div>
        );

      case "performanceStats":
        return (
          <div className="flex flex-col gap-3">
            {primaryLabel ? (
              <span className="text-muted-foreground text-xs font-medium">{primaryLabel}</span>
            ) : null}
            {performanceItems.map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums">
                    {typeof item.value === "number" ? formatStatValue(item.value) : item.value}
                    {item.percentage !== undefined ? ` (${item.percentage}%)` : ""}
                  </span>
                </div>
                {item.percentage !== undefined ? (
                  <Progress value={item.percentage} className="h-1.5" />
                ) : null}
              </div>
            ))}
          </div>
        );

      case "financialStats":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {primaryLabel ? (
                <span className="text-muted-foreground text-xs">{primaryLabel}</span>
              ) : null}
              {formattedPrimary ? (
                <span className="text-2xl font-semibold tabular-nums">{formattedPrimary}</span>
              ) : null}
            </div>
            {statItems.length > 0 ? <HoverCardStatGrid items={statItems} columns={2} /> : null}
          </div>
        );
    }
  })();

  const resolvedTrigger = (() => {
    if (trigger) {
      return trigger;
    }

    return (
      <button type="button" className="text-sm font-medium hover:underline">
        {primaryLabel ?? "View stats"}
      </button>
    );
  })();

  return (
    <HoverCardShell
      {...shellProps}
      trigger={resolvedTrigger}
      contentClassName={resolvedContentClassName}
    >
      {content}
    </HoverCardShell>
  );
}
