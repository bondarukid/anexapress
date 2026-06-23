"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { InteractiveSliderProps } from "@/components/sliders/types";
import { SliderHeader } from "@/components/sliders/utils/slider-layout";
import { clampSliderValue } from "@/components/sliders/utils/slider-value";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

const DEFAULT_PRESET_VALUES = [0, 25, 50, 75, 100];

/**
 * Interactive slider covering Kibo UI interactive-1…5 patterns.
 * https://www.kibo-ui.com/patterns/slider/interactive
 */
export function InteractiveSlider({
  variant = "syncedInput",
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
  inputProps,
  stepAmount = 10,
  presetValues = DEFAULT_PRESET_VALUES,
  resetValue,
  resetLabel = "Reset",
  previewClassName,
  previewRenderer,
  ...sliderProps
}: InteractiveSliderProps) {
  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount: 1,
  });

  const currentValue = value[0];
  const resolvedResetValue =
    resetValue ?? defaultValue?.[0] ?? Math.round((min + max) / 2);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (!Number.isNaN(nextValue)) {
      setValue([clampSliderValue(nextValue, min, max)]);
    }
  };

  const increment = () => {
    setValue([clampSliderValue(currentValue + stepAmount, min, max)]);
  };

  const decrement = () => {
    setValue([clampSliderValue(currentValue - stepAmount, min, max)]);
  };

  const reset = () => {
    setValue([clampSliderValue(resolvedResetValue, min, max)]);
  };

  if (variant === "syncedInput") {
    const inputId = `${id}-value`;
    const labelId = getFieldLabelId(id);
    const inputLabelId = getFieldLabelId(inputId);

    return (
      <Field className={cn("w-full max-w-md", containerClassName)}>
        <FieldLabel className={labelClassName} htmlFor={id} id={labelId}>
          {label ?? "Value"}
        </FieldLabel>
        <div className="flex items-center gap-4">
          <Slider
            className={cn("flex-1", className)}
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            onValueChange={setValue}
            step={step}
            value={value}
            aria-labelledby={labelId}
            {...sliderProps}
          />
          <Field className="w-20 shrink-0">
            <FieldLabel className="sr-only" htmlFor={inputId} id={inputLabelId}>
              Numeric value
            </FieldLabel>
            <Input
              className="w-20"
              disabled={disabled}
              id={inputId}
              max={max}
              min={min}
              onChange={handleInputChange}
              type="number"
              value={currentValue}
              {...inputProps}
            />
          </Field>
        </div>
      </Field>
    );
  }

  if (variant === "incrementDecrement") {
    const labelId = getFieldLabelId(id);

    return (
      <Field className={cn("w-full max-w-md", containerClassName)}>
        <SliderHeader
          htmlFor={id}
          label={label ?? "Quantity"}
          labelClassName={labelClassName}
          value={currentValue}
          valueFormatter={valueFormatter}
        />
        <div className="flex items-center gap-4">
          <Button
            disabled={disabled || currentValue <= min}
            onClick={decrement}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <MinusIcon data-icon="inline-start" />
          </Button>
          <Slider
            className={cn("flex-1", className)}
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            onValueChange={setValue}
            step={step}
            value={value}
            aria-labelledby={labelId}
            {...sliderProps}
          />
          <Button
            disabled={disabled || currentValue >= max}
            onClick={increment}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
          </Button>
        </div>
      </Field>
    );
  }

  if (variant === "presets") {
    const labelId = getFieldLabelId(id);

    return (
      <Field className={cn("w-full max-w-md", containerClassName)}>
        <SliderHeader
          htmlFor={id}
          label={label ?? "Level"}
          labelClassName={labelClassName}
          value={currentValue}
          valueFormatter={valueFormatter}
        />
        <Slider
          className={className}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          step={step}
          value={value}
          aria-labelledby={labelId}
          {...sliderProps}
        />
        <div className="flex flex-wrap gap-2">
          {presetValues.map((preset) => (
            <Button
              key={preset}
              disabled={disabled}
              onClick={() => setValue([preset])}
              size="sm"
              type="button"
              variant="outline"
            >
              {preset}
            </Button>
          ))}
        </div>
      </Field>
    );
  }

  if (variant === "reset") {
    const labelId = getFieldLabelId(id);

    return (
      <Field className={cn("w-full max-w-md", containerClassName)}>
        <div className="flex items-center justify-between">
          <FieldLabel className={labelClassName} htmlFor={id} id={labelId}>
            {label ?? "Adjustment"}
          </FieldLabel>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{currentValue}</span>
            <Button
              disabled={disabled}
              onClick={reset}
              size="sm"
              type="button"
              variant="outline"
            >
              {resetLabel}
            </Button>
          </div>
        </div>
        <Slider
          className={className}
          disabled={disabled}
          id={id}
          max={max}
          min={min}
          onValueChange={setValue}
          step={step}
          value={value}
          aria-labelledby={labelId}
          {...sliderProps}
        />
      </Field>
    );
  }

  return (
    <Field className={cn("w-full max-w-md gap-4", containerClassName)}>
      <SliderHeader
        htmlFor={id}
        label={label ?? "Border Radius"}
        labelClassName={labelClassName}
        value={currentValue}
        valueFormatter={(nextValue) => `${nextValue}px`}
      />
      <Slider
        className={className}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onValueChange={setValue}
        step={step}
        value={value}
        aria-labelledby={getFieldLabelId(id)}
        {...sliderProps}
      />
      {previewRenderer ? (
        previewRenderer(currentValue)
      ) : (
        <div
          className={cn(
            "h-24 bg-muted-foreground transition-all",
            previewClassName,
          )}
          style={{ borderRadius: `${currentValue}px` }}
        />
      )}
    </Field>
  );
}
