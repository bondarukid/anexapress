"use client";

import { GaugeIcon, SunIcon, ThermometerIcon, Volume2Icon } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import type { SettingsSliderProps } from "@/components/sliders/types";
import {
  formatPercentValue,
  formatTemperatureValue,
  resolveSliderDisplayValue,
} from "@/components/sliders/utils/slider-formatters";
import {
  SliderFooter,
  SliderHeader,
  SliderStepIndicators,
} from "@/components/sliders/utils/slider-layout";
import { useControllableSlider } from "@/components/sliders/utils/use-controllable-slider";
import { cn } from "@/lib/utils";

const SPEED_LABELS = ["Slow", "Normal", "Fast", "Very Fast"];

const VARIANT_DEFAULTS = {
  volume: {
    icon: Volume2Icon,
    formatter: formatPercentValue,
  },
  brightness: {
    icon: SunIcon,
    formatter: formatPercentValue,
  },
  temperature: {
    icon: ThermometerIcon,
    formatter: formatTemperatureValue,
    min: 16,
    max: 30,
  },
  speed: {
    icon: GaugeIcon,
    min: 0,
    max: 3,
    step: 1,
  },
} as const;

/**
 * Settings slider covering Kibo UI settings-1…4 patterns.
 * https://www.kibo-ui.com/patterns/slider/settings
 */
export function SettingsSlider({
  variant = "volume",
  value: valueProp,
  defaultValue,
  onValueChange,
  min: minProp,
  max: maxProp,
  step: stepProp,
  disabled,
  id = "slider",
  className,
  containerClassName,
  label,
  labelClassName,
  icon: IconProp,
  valueFormatter,
  footerLabels,
  ...sliderProps
}: SettingsSliderProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const min = minProp ?? ("min" in defaults ? defaults.min : 0);
  const max = maxProp ?? ("max" in defaults ? defaults.max : 100);
  const step = stepProp ?? ("step" in defaults ? defaults.step : undefined);
  const Icon = IconProp ?? defaults.icon;

  const { value, setValue } = useControllableSlider({
    value: valueProp,
    defaultValue,
    onValueChange,
    min,
    max,
    thumbCount: 1,
  });

  const resolvedFormatter =
    valueFormatter ??
    ("formatter" in defaults ? defaults.formatter : undefined) ??
    (variant === "speed"
      ? (currentValue: number) => SPEED_LABELS[currentValue] ?? String(currentValue)
      : formatPercentValue);

  const speedFooterLabels = footerLabels ?? SPEED_LABELS;

  return (
    <div
      className={cn("flex w-full max-w-md flex-col gap-2", containerClassName)}
    >
      <SliderHeader
        htmlFor={id}
        label={label}
        labelClassName={labelClassName}
        leading={Icon ? <Icon className="size-4" /> : undefined}
        value={value[0]}
        valueFormatter={resolvedFormatter}
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
        {...sliderProps}
      />

      {variant === "temperature" ? (
        <SliderFooter
          start={resolveSliderDisplayValue(min, 0, formatTemperatureValue)}
          end={resolveSliderDisplayValue(max, 1, formatTemperatureValue)}
        />
      ) : null}

      {variant === "speed" ? (
        <SliderStepIndicators values={speedFooterLabels} />
      ) : null}
    </div>
  );
}
