import type { BaseSliderProps } from "@/components/sliders/types/slider.types";

export type RangeSliderVariant =
  | "basic"
  | "price"
  | "valueDisplay"
  | "constrained"
  | "percentage";

export type RangeSliderProps = BaseSliderProps & {
  variant?: RangeSliderVariant;
  minGap?: number;
  constraintHint?: string;
};
