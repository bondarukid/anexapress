"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { StandardSliderProps } from "@/components/sliders/types";
import {
  formatPercentValue,
  resolveSliderDisplayValue,
} from "@/components/sliders/utils/slider-formatters";
import {
  SliderFooter,
  SliderHeader,
  SliderStepIndicators,
} from "@/components/sliders/utils/slider-layout";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { cn } from "@/lib/utils";

const DEFAULT_STEP_INDICATORS = [0, 25, 50, 75, 100];

/**
 * Standard slider covering Kibo UI standard-1…5 patterns.
 * https://www.kibo-ui.com/patterns/slider/standard
 */
export function StandardSlider({
  variant = "simple",
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step,
  disabled,
  id = "slider",
  className,
  containerClassName,
  label,
  labelClassName,
  valueFormatter,
  stepIndicatorValues = DEFAULT_STEP_INDICATORS,
  ...sliderProps
}: StandardSliderProps) {
  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount: 1,
  });

  const formatter =
    valueFormatter ??
    (variant === "valueDisplay" || variant === "stepIndicators"
      ? formatPercentValue
      : undefined);

  const showHeader = variant === "valueDisplay" || variant === "stepIndicators";

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-2", containerClassName)}
    >
      {variant === "label" && label ? (
        <Label className={labelClassName} htmlFor={id}>
          {label}
        </Label>
      ) : null}

      {showHeader ? (
        <SliderHeader
          htmlFor={id}
          label={label}
          labelClassName={labelClassName}
          value={value[0]}
          valueFormatter={formatter}
        />
      ) : null}

      <Slider
        className={className}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onValueChange={setValue}
        step={step}
        value={value}
        {...sliderProps}
      />

      {variant === "minMaxLabels" ? (
        <SliderFooter
          start={resolveSliderDisplayValue(min, 0, valueFormatter)}
          end={resolveSliderDisplayValue(max, 1, valueFormatter)}
        />
      ) : null}

      {variant === "stepIndicators" ? (
        <SliderStepIndicators formatter={formatter} values={stepIndicatorValues} />
      ) : null}
    </div>
  );
}
