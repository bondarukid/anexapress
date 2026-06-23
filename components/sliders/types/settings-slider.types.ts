import type { LucideIcon } from "lucide-react";

import type { BaseSliderProps } from "@/components/sliders/types/slider.types";

export type SettingsSliderVariant =
  | "volume"
  | "brightness"
  | "temperature"
  | "speed";

export type SettingsSliderProps = BaseSliderProps & {
  variant?: SettingsSliderVariant;
  icon?: LucideIcon;
  footerLabels?: string[];
  stepIndicatorValues?: number[];
};
