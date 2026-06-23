import type { SettingsSliderProps } from "@/components/sliders/types";

/**
 * Kibo UI settings slider pattern presets.
 */
export const settingsPresets = {
  volume: {
    variant: "volume",
    label: "Volume",
    defaultValue: [65],
  },
  brightness: {
    variant: "brightness",
    label: "Brightness",
    defaultValue: [80],
  },
  temperature: {
    variant: "temperature",
    label: "Temperature",
    defaultValue: [22],
    min: 16,
    max: 30,
  },
  speed: {
    variant: "speed",
    label: "Speed",
    defaultValue: [1],
    min: 0,
    max: 3,
    step: 1,
  },
} satisfies Record<string, Partial<SettingsSliderProps>>;
