"use client";

import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { StandardLabelProps } from "@/components/labels/types";
import { cn } from "@/lib/utils";

function formatCharacterCount(
  characterCount: string | undefined,
  currentCount: number | undefined,
  maxCount: number | undefined,
) {
  if (characterCount) {
    return characterCount;
  }

  if (currentCount !== undefined && maxCount !== undefined) {
    return `${currentCount}/${maxCount}`;
  }

  return undefined;
}

/**
 * Configurable label covering Kibo UI label-standard-1…8 + base standard.
 * https://www.kibo-ui.com/patterns/label/standard
 */
export function StandardLabel({
  variant = "standard",
  description,
  tooltip,
  badge,
  badgeVariant = "secondary",
  optionalText = "(optional)",
  currentCount,
  maxCount,
  characterCount,
  errorMessage,
  tooltipAriaLabel = "More information",
  containerClassName,
  descriptionClassName,
  countClassName,
  className,
  children,
  htmlFor,
  ...labelProps
}: StandardLabelProps) {
  if (variant === "description") {
    return (
      <div className={cn("flex flex-col gap-1", containerClassName)}>
        <Label className={className} htmlFor={htmlFor} {...labelProps}>
          {children}
        </Label>
        {description ? (
          <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  if (variant === "characterCount") {
    const countLabel = formatCharacterCount(characterCount, currentCount, maxCount);

    return (
      <div className={cn("flex items-center justify-between gap-2", containerClassName)}>
        <Label className={className} htmlFor={htmlFor} {...labelProps}>
          {children}
        </Label>
        {countLabel ? (
          <span className={cn("text-xs text-muted-foreground", countClassName)}>
            {countLabel}
          </span>
        ) : null}
      </div>
    );
  }

  if (variant === "required") {
    return (
      <Label className={className} htmlFor={htmlFor} {...labelProps}>
        {children} <span className="text-destructive">*</span>
      </Label>
    );
  }

  if (variant === "tooltip") {
    return (
      <Label className={className} htmlFor={htmlFor} {...labelProps}>
        {children}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={tooltipAriaLabel}
                className="inline-flex text-muted-foreground"
                type="button"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ) : null}
      </Label>
    );
  }

  if (variant === "badge") {
    return (
      <Label className={className} htmlFor={htmlFor} {...labelProps}>
        {children}
        {badge ? (
          <Badge className="text-xs" variant={badgeVariant}>
            {badge}
          </Badge>
        ) : null}
      </Label>
    );
  }

  if (variant === "optional") {
    return (
      <Label className={className} htmlFor={htmlFor} {...labelProps}>
        {children}{" "}
        <span className="font-normal text-muted-foreground">{optionalText}</span>
      </Label>
    );
  }

  if (variant === "error") {
    return (
      <Label className={cn("text-destructive", className)} htmlFor={htmlFor} {...labelProps}>
        {children}
        {errorMessage ? (
          <span className="ml-1 text-xs font-normal">• {errorMessage}</span>
        ) : null}
      </Label>
    );
  }

  if (variant === "section") {
    return (
      <Label
        className={cn("text-base font-semibold", className)}
        htmlFor={htmlFor}
        {...labelProps}
      >
        {children}
      </Label>
    );
  }

  return (
    <Label className={className} htmlFor={htmlFor} {...labelProps}>
      {children}
    </Label>
  );
}
