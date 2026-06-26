"use client";

import { CircleHelp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type InspectorHelpLabelProps = {
  label: string;
  help: string;
  className?: string;
};

/**
 * Inspector field label with a hover help tooltip.
 */
export function InspectorHelpLabel({ label, help, className }: InspectorHelpLabelProps) {
  return (
    <div className={className ?? "flex items-center justify-between gap-2"}>
      <span className="text-sm font-medium">{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-0.5 transition-colors"
            aria-label={`Help: ${label}`}
          >
            <CircleHelp className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={6} className="max-w-56 text-pretty">
          {help}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
