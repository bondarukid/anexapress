"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type {
  StyledSliderColorScheme,
  StyledSliderProps,
} from "@/components/sliders/types";
import { formatPercentValue } from "@/components/sliders/utils/slider-formatters";
import { SliderHeader } from "@/components/sliders/utils/slider-layout";
import { valueToPercentage } from "@/components/sliders/utils/slider-value";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { cn } from "@/lib/utils";

const COLOR_SCHEME_CLASSES: Record<StyledSliderColorScheme, string> = {
  green:
    "[&_[data-slot=slider-range]]:bg-green-500 [&_[data-slot=slider-thumb]]:border-green-500",
  primary:
    "[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary",
  destructive:
    "[&_[data-slot=slider-range]]:bg-destructive [&_[data-slot=slider-thumb]]:border-destructive",
};

const VARIANT_CLASSES: Record<NonNullable<StyledSliderProps["variant"]>, string> = {
  colored: "",
  tooltip: "",
  large: "[&_[data-slot=slider-thumb]]:size-6 [&_[data-slot=slider-track]]:h-3",
  minimal:
    "[&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-track]]:border [&_[data-slot=slider-track]]:bg-transparent",
  gradient:
    "[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-gradient-to-r [&_[data-slot=slider-track]]:from-blue-500 [&_[data-slot=slider-track]]:to-red-500",
};

/**
 * Styled slider covering Kibo UI styled-1…5 patterns.
 * https://www.kibo-ui.com/patterns/slider/styled
 */
export function StyledSlider({
  variant = "colored",
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step,
  disabled,
  id = "slider",
  className,
  sliderClassName,
  containerClassName,
  label,
  labelClassName,
  valueFormatter,
  colorScheme = "green",
  ...sliderProps
}: StyledSliderProps) {
  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount: 1,
  });

  const currentValue = value[0];
  const formatter =
    valueFormatter ??
    (variant === "gradient"
      ? (nextValue: number) => `${nextValue}°`
      : formatPercentValue);

  const sliderClasses = cn(
    VARIANT_CLASSES[variant],
    variant === "colored" ? COLOR_SCHEME_CLASSES[colorScheme] : undefined,
    sliderClassName,
    className,
  );

  const showHeader = variant !== "tooltip";

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-2", containerClassName)}
    >
      {variant === "tooltip" && label ? (
        <Label className={labelClassName} htmlFor={id}>
          {label}
        </Label>
      ) : null}

      {showHeader ? (
        <SliderHeader
          htmlFor={id}
          label={label}
          labelClassName={labelClassName}
          value={currentValue}
          valueFormatter={formatter}
        />
      ) : null}

      <div className={cn(variant === "tooltip" && "relative pt-6")}>
        <Slider
          className={sliderClasses}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          step={step}
          value={value}
          {...sliderProps}
        />
        {variant === "tooltip" ? (
          <div
            className="-translate-x-1/2 -top-2 absolute rounded bg-primary px-2 py-1 text-primary-foreground text-xs"
            style={{ left: `${valueToPercentage(currentValue, min, max)}%` }}
          >
            {formatter(currentValue, 0)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
