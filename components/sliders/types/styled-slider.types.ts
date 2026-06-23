import type { BaseSliderProps } from "@/components/sliders/types/slider.types";

export type StyledSliderVariant =
  | "colored"
  | "tooltip"
  | "large"
  | "minimal"
  | "gradient";

export type StyledSliderColorScheme = "green" | "primary" | "destructive";

export type StyledSliderProps = BaseSliderProps & {
  variant?: StyledSliderVariant;
  colorScheme?: StyledSliderColorScheme;
  sliderClassName?: string;
};
