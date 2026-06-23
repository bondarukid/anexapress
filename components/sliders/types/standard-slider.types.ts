import type { BaseSliderProps } from "@/components/sliders/types/slider.types";

export type StandardSliderVariant =
  | "simple"
  | "label"
  | "valueDisplay"
  | "minMaxLabels"
  | "stepIndicators";

export type StandardSliderProps = BaseSliderProps & {
  variant?: StandardSliderVariant;
  stepIndicatorValues?: number[];
};
