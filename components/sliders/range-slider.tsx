"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { RangeSliderProps } from "@/components/sliders/types";
import {
  formatCurrencyValue,
  formatPercentValue,
  formatRangeValue,
  resolveSliderDisplayValue,
} from "@/components/sliders/utils/slider-formatters";
import { SliderFooter, SliderHeader } from "@/components/sliders/utils/slider-layout";
import { applyMinGapConstraint } from "@/components/sliders/utils/slider-value";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { cn } from "@/lib/utils";

/**
 * Range slider covering Kibo UI range-1…5 patterns.
 * https://www.kibo-ui.com/patterns/slider/range
 */
export function RangeSlider({
  variant = "basic",
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = variant === "price" ? 1000 : 100,
  step,
  disabled,
  id = "slider",
  className,
  containerClassName,
  label,
  labelClassName,
  valueFormatter,
  minGap = 10,
  constraintHint = "Minimum gap: 10",
  ...sliderProps
}: RangeSliderProps) {
  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount: 2,
  });

  const priceFormatter = valueFormatter ?? formatCurrencyValue;
  const percentFormatter = valueFormatter ?? formatPercentValue;

  const handleValueChange = (nextValue: number[]) => {
    if (variant === "constrained") {
      const constrainedValue = applyMinGapConstraint(nextValue, value, minGap);
      if (constrainedValue) {
        setValue(constrainedValue);
      }
      return;
    }

    setValue(nextValue);
  };

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-2", containerClassName)}
    >
      {variant === "basic" && label ? (
        <Label className={labelClassName} htmlFor={id}>
          {label}
        </Label>
      ) : null}

      {variant === "valueDisplay" || variant === "percentage" ? (
        <SliderHeader
          htmlFor={id}
          label={label}
          labelClassName={labelClassName}
          trailing={
            <span className="text-muted-foreground text-sm">
              {variant === "percentage"
                ? formatRangeValue(value, percentFormatter)
                : formatRangeValue(value, valueFormatter)}
            </span>
          }
        />
      ) : null}

      {variant === "constrained" ? (
        <>
          <SliderHeader
            htmlFor={id}
            label={label}
            labelClassName={labelClassName}
            trailing={
              <span className="text-muted-foreground text-sm">
                {formatRangeValue(value, valueFormatter)}
              </span>
            }
          />
          <p className="text-muted-foreground text-xs">{constraintHint}</p>
        </>
      ) : null}

      <Slider
        className={className}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onValueChange={handleValueChange}
        step={step}
        value={value}
        {...sliderProps}
      />

      {variant === "price" ? (
        <SliderFooter
          start={resolveSliderDisplayValue(value[0], 0, priceFormatter)}
          end={resolveSliderDisplayValue(value[1], 1, priceFormatter)}
        />
      ) : null}

      {variant === "percentage" ? (
        <SliderFooter
          start={resolveSliderDisplayValue(min, 0, percentFormatter)}
          end={resolveSliderDisplayValue(max, 1, percentFormatter)}
        />
      ) : null}
    </div>
  );
}
