import type { SliderValue } from "@/components/sliders/types/slider.types";

/**
 * Clamps a numeric value between min and max bounds.
 */
export function clampSliderValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Normalizes slider values to the expected thumb count.
 */
export function normalizeSliderValue(
  value: SliderValue | undefined,
  min: number,
  max: number,
  thumbCount: number,
): SliderValue {
  if (value && value.length === thumbCount) {
    return value.map((item) => clampSliderValue(item, min, max));
  }

  if (thumbCount === 1) {
    return [Math.round((min + max) / 2)];
  }

  const quarter = Math.round((max - min) * 0.25);
  return [min + quarter, max - quarter];
}

/**
 * Ensures dual-thumb ranges keep a minimum distance between handles.
 */
export function applyMinGapConstraint(
  nextValue: SliderValue,
  previousValue: SliderValue,
  minGap: number,
): SliderValue | null {
  if (nextValue.length !== 2 || previousValue.length !== 2) {
    return nextValue;
  }

  if (nextValue[1] - nextValue[0] >= minGap) {
    return nextValue;
  }

  return null;
}

/**
 * Converts slider position to percentage for tooltip placement.
 */
export function valueToPercentage(value: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
}
