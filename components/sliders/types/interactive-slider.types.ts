import type { ComponentProps, ReactNode } from "react";

import type { BaseSliderProps } from "@/components/sliders/types/slider.types";
import type { Input } from "@/components/ui/input";

export type InteractiveSliderVariant =
  | "syncedInput"
  | "incrementDecrement"
  | "presets"
  | "reset"
  | "livePreview";

export type InteractiveSliderProps = BaseSliderProps & {
  variant?: InteractiveSliderVariant;
  inputProps?: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type">;
  stepAmount?: number;
  presetValues?: number[];
  resetValue?: number;
  resetLabel?: string;
  previewClassName?: string;
  previewRenderer?: (value: number) => ReactNode;
};
