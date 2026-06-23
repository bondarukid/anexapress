"use client";

import { Code, HelpCircle, Info, TriangleAlert } from "lucide-react";

import type { InfoHoverCardProps } from "@/components/hover-cards/types";
import { HoverCardShell } from "@/components/hover-cards/utils/hover-card-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Info hover card covering Kibo UI info patterns.
 * https://www.kibo-ui.com/patterns/hover-card/info
 */
export function InfoHoverCard({
  variant = "simpleInfo",
  trigger,
  title,
  description,
  badgeLabel,
  icon: IconProp,
  method = "GET",
  endpoint = "/api/v1/resource",
  authNote = "Requires Bearer token",
  contentClassName,
  ...shellProps
}: InfoHoverCardProps) {
  const resolvedContentClassName = cn(
    variant === "technicalInfo" && "w-80",
    variant === "warningInfo" && "border-warning/30",
    contentClassName,
  );

  const content = (() => {
    switch (variant) {
      case "simpleInfo":
        return (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {description ?? "Additional contextual information appears here."}
          </p>
        );

      case "withTitle":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Info className="text-muted-foreground size-4 shrink-0" />
              <p className="text-sm font-semibold">{title ?? "Information"}</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description ?? "Structured informational content."}
            </p>
          </div>
        );

      case "withIconAndBadge":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {IconProp ? <IconProp className="text-muted-foreground size-4 shrink-0" /> : null}
              <p className="text-sm font-semibold">{title ?? "Details"}</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description ?? "Badge-triggered info content."}
            </p>
          </div>
        );

      case "warningInfo":
        return (
          <div className="flex flex-col gap-2">
            <div className="text-warning flex items-center gap-2">
              <TriangleAlert className="size-4 shrink-0" />
              <p className="text-sm font-semibold">{title ?? "Warning"}</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description ?? "Important warning information."}
            </p>
          </div>
        );

      case "technicalInfo":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Code className="text-muted-foreground size-4 shrink-0" />
              <p className="text-sm font-semibold">{title ?? "API Endpoint"}</p>
            </div>
            <div className="bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 font-mono text-xs">
              <span className="text-primary font-semibold">{method}</span>
              <span className="truncate">{endpoint}</span>
            </div>
            <p className="text-muted-foreground text-xs">{authNote}</p>
          </div>
        );
    }
  })();

  const resolvedTrigger = (() => {
    if (trigger) {
      return trigger;
    }

    if (variant === "withIconAndBadge" && badgeLabel) {
      return <Badge variant="secondary">{badgeLabel}</Badge>;
    }

    if (variant === "technicalInfo") {
      return (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
          aria-label="Technical information"
        >
          <Code className="size-4" />
        </button>
      );
    }

    if (variant === "warningInfo") {
      return (
        <button
          type="button"
          className="text-warning hover:text-warning/80 inline-flex items-center"
          aria-label="Warning information"
        >
          <TriangleAlert className="size-4" />
        </button>
      );
    }

    return (
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground inline-flex items-center"
        aria-label="More information"
      >
        <HelpCircle className="size-4" />
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
