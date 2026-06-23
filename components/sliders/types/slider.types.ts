import type { ComponentProps } from "react";

import type { Slider } from "@/components/ui/slider";

export type SliderValue = number[];

export type SliderValueFormatter = (value: number, index: number) => string;

type SliderPrimitiveProps = Omit<
  ComponentProps<typeof Slider>,
  "value" | "defaultValue" | "onValueChange"
>;

/**
 * Shared props for all Kibo UI slider category components.
 */
export type BaseSliderProps = SliderPrimitiveProps & {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onValueChange?: (value: SliderValue) => void;
  label?: string;
  labelClassName?: string;
  showValue?: boolean;
  valueFormatter?: SliderValueFormatter;
  containerClassName?: string;
};
