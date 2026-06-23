import type { ReactNode } from "react";

import type { SliderValueFormatter } from "@/components/sliders/types/slider.types";
import { resolveSliderDisplayValue } from "@/components/sliders/utils/slider-formatters";
import { FieldLabel } from "@/components/ui/field";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

type SliderHeaderProps = {
  label?: string;
  labelClassName?: string;
  htmlFor?: string;
  value?: number;
  valueIndex?: number;
  valueFormatter?: SliderValueFormatter;
  valueClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/**
 * Header row with optional icon, label, and formatted value.
 */
export function SliderHeader({
  label,
  labelClassName,
  htmlFor,
  value,
  valueIndex = 0,
  valueFormatter,
  valueClassName,
  leading,
  trailing,
  className,
}: SliderHeaderProps) {
  if (!label && value === undefined && !leading && !trailing) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        {leading}
        {label ? (
          <FieldLabel
            className={labelClassName}
            htmlFor={htmlFor}
            id={htmlFor ? getFieldLabelId(htmlFor) : undefined}
          >
            {label}
          </FieldLabel>
        ) : null}
      </div>
      {trailing ??
        (value !== undefined ? (
          <span className={cn("text-muted-foreground text-sm", valueClassName)}>
            {resolveSliderDisplayValue(value, valueIndex, valueFormatter)}
          </span>
        ) : null)}
    </div>
  );
}

type SliderFooterProps = {
  start: ReactNode;
  end: ReactNode;
  className?: string;
};

/**
 * Footer row for min/max or range endpoints.
 */
export function SliderFooter({ start, end, className }: SliderFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-muted-foreground text-sm",
        className,
      )}
    >
      <span>{start}</span>
      <span>{end}</span>
    </div>
  );
}

type SliderStepIndicatorsProps = {
  values: Array<string | number>;
  formatter?: SliderValueFormatter;
  className?: string;
};

/**
 * Step tick labels below the slider track.
 */
export function SliderStepIndicators({
  values,
  formatter,
  className,
}: SliderStepIndicatorsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between text-muted-foreground text-xs",
        className,
      )}
    >
      {values.map((item, index) => (
        <span key={`${item}-${index}`}>
          {typeof item === "string"
            ? item
            : resolveSliderDisplayValue(item, index, formatter)}
        </span>
      ))}
    </div>
  );
}

type SliderSideLabelsProps = {
  labels: Array<string | number>;
  align?: "start" | "end";
  className?: string;
  itemClassName?: string;
};

/**
 * Side labels for vertical sliders.
 */
export function SliderSideLabels({
  labels,
  align = "end",
  className,
  itemClassName,
}: SliderSideLabelsProps) {
  return (
    <div
      className={cn(
        "flex flex-col text-muted-foreground text-xs",
        align === "end" ? "items-end gap-2" : "items-start gap-1",
        className,
      )}
    >
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={cn(index > 0 && align === "end" ? "mt-8" : undefined, itemClassName)}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
