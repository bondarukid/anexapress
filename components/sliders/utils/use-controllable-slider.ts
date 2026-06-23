"use client";

import { useCallback, useState } from "react";

import type { SliderValue } from "@/components/sliders/types/slider.types";
import { normalizeSliderValue } from "@/components/sliders/utils/slider-value";

type UseControllableSliderOptions = {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  thumbCount?: number;
};

/**
 * Controlled/uncontrolled slider state shared across category components.
 */
export function useControllableSlider({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  thumbCount = 1,
}: UseControllableSliderOptions) {
  const [uncontrolledValue, setUncontrolledValue] = useState<SliderValue>(() =>
    normalizeSliderValue(defaultValue, min, max, thumbCount),
  );

  const isControlled = valueProp !== undefined;
  const value = isControlled
    ? normalizeSliderValue(valueProp, min, max, thumbCount)
    : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: SliderValue) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return { value, setValue };
}
