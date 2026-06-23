"use client";

import type { SliderFieldProps } from "@/components/fields/types/field.types";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/**
 * Slider field block for advanced field patterns.
 */
export function SliderField({
  title,
  ariaLabel,
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  description,
  className,
  sliderClassName,
}: SliderFieldProps) {
  return (
    <Field className={className}>
      <FieldTitle>{title}</FieldTitle>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <Slider
        aria-label={ariaLabel}
        className={cn("mt-2 w-full", sliderClassName)}
        max={max}
        min={min}
        onValueChange={onValueChange}
        step={step}
        value={value}
      />
    </Field>
  );
}
