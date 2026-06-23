"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { VerticalSliderProps } from "@/components/sliders/types";
import {
  formatHeightValue,
  formatPercentValue,
  resolveSliderDisplayValue,
} from "@/components/sliders/utils/slider-formatters";
import { SliderSideLabels } from "@/components/sliders/utils/slider-layout";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { cn } from "@/lib/utils";

const DEFAULT_SIDE_LABELS = [100, 75, 50, 25, 0];
const DEFAULT_INDICATOR_LABELS = ["Max", "High", "Med", "Low", "Min"];

/**
 * Vertical slider covering Kibo UI vertical-1…5 patterns.
 * https://www.kibo-ui.com/patterns/slider/vertical
 */
export function VerticalSlider({
  variant = "volume",
  value: valueProp,
  defaultValue,
  onValueChange,
  min = variant === "height" ? 140 : 0,
  max = variant === "height" ? 200 : 100,
  step: stepProp,
  disabled,
  id = "slider",
  className,
  containerClassName,
  label,
  labelClassName,
  valueFormatter,
  height = variant === "indicators" ? "h-52" : "h-48",
  sideLabels = DEFAULT_SIDE_LABELS,
  indicatorLabels = DEFAULT_INDICATOR_LABELS,
  ...sliderProps
}: VerticalSliderProps) {
  const thumbCount = variant === "range" ? 2 : 1;
  const step = stepProp ?? (variant === "indicators" ? 25 : undefined);

  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount,
  });

  const formatter =
    valueFormatter ??
    (variant === "height"
      ? formatHeightValue
      : variant === "volume" || variant === "indicators"
        ? formatPercentValue
        : undefined);

  const sliderClassName = cn(
    typeof height === "number" ? undefined : height,
    className,
  );
  const sliderStyle =
    typeof height === "number" ? { height: `${height}px` } : undefined;

  if (variant === "volume") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4",
          containerClassName,
        )}
      >
        <Label className={labelClassName} htmlFor={id}>
          {label ?? "Volume"}
        </Label>
        <Slider
          className={sliderClassName}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          orientation="vertical"
          step={step}
          style={sliderStyle}
          value={value}
          {...sliderProps}
        />
        <span className="text-muted-foreground text-sm">
          {resolveSliderDisplayValue(value[0], 0, formatter)}
        </span>
      </div>
    );
  }

  if (variant === "height") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4",
          containerClassName,
        )}
      >
        <Label className={labelClassName} htmlFor={id}>
          {label ?? "Height (cm)"}
        </Label>
        <Slider
          className={sliderClassName}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          orientation="vertical"
          step={step}
          style={sliderStyle}
          value={value}
          {...sliderProps}
        />
        <span className="text-muted-foreground text-sm">
          {resolveSliderDisplayValue(value[0], 0, formatter)}
        </span>
      </div>
    );
  }

  if (variant === "labels") {
    return (
      <div className={cn("flex items-center gap-4", containerClassName)}>
        <SliderSideLabels labels={sideLabels} />
        <Slider
          className={sliderClassName}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          orientation="vertical"
          step={step}
          style={sliderStyle}
          value={value}
          {...sliderProps}
        />
        <div className="flex flex-col gap-2">
          <Label className={labelClassName} htmlFor={id}>
            {label ?? "Level"}
          </Label>
          <span className="text-muted-foreground text-sm">{value[0]}</span>
        </div>
      </div>
    );
  }

  if (variant === "range") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4",
          containerClassName,
        )}
      >
        <Label className={labelClassName} htmlFor={id}>
          {label ?? "Range"}
        </Label>
        <Slider
          className={sliderClassName}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          orientation="vertical"
          step={step}
          style={sliderStyle}
          value={value}
          {...sliderProps}
        />
        <div className="flex flex-col items-center text-muted-foreground text-sm">
          <span>{value[1]}</span>
          <span>-</span>
          <span>{value[0]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", containerClassName)}>
      <div className="flex flex-col gap-2">
        <Label className={labelClassName} htmlFor={id}>
          {label ?? "Intensity"}
        </Label>
        <span className="text-muted-foreground text-sm">
          {resolveSliderDisplayValue(value[0], 0, formatter)}
        </span>
      </div>
      <Slider
        className={sliderClassName}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onValueChange={setValue}
        orientation="vertical"
        step={step}
        style={sliderStyle}
        value={value}
        {...sliderProps}
      />
      <SliderSideLabels
        align="start"
        itemClassName="h-11"
        labels={indicatorLabels}
      />
    </div>
  );
}
