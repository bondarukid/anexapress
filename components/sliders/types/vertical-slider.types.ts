import type { BaseSliderProps } from "@/components/sliders/types/slider.types";

export type VerticalSliderVariant =
  | "volume"
  | "height"
  | "labels"
  | "range"
  | "indicators";

export type VerticalSliderProps = BaseSliderProps & {
  variant?: VerticalSliderVariant;
  height?: string | number;
  sideLabels?: string[] | number[];
  indicatorLabels?: string[];
};
