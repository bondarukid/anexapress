import type { SliderValueFormatter } from "@/components/sliders/types/slider.types";

/**
 * Formats a slider value as plain text.
 */
export const formatPlainValue: SliderValueFormatter = (value) => String(value);

/**
 * Formats a slider value as a percentage.
 */
export const formatPercentValue: SliderValueFormatter = (value) => `${value}%`;

/**
 * Formats a slider value as currency.
 */
export const formatCurrencyValue: SliderValueFormatter = (value) => `$${value}`;

/**
 * Formats a slider value as temperature in Celsius.
 */
export const formatTemperatureValue: SliderValueFormatter = (value) => `${value}°C`;

/**
 * Formats a slider value as height in centimeters.
 */
export const formatHeightValue: SliderValueFormatter = (value) => `${value} cm`;

/**
 * Formats a range pair as "min - max".
 */
export function formatRangeValue(
  values: number[],
  formatter: SliderValueFormatter = formatPlainValue,
): string {
  if (values.length < 2) {
    return formatter(values[0] ?? 0, 0);
  }

  return `${formatter(values[0], 0)} - ${formatter(values[1], 1)}`;
}

/**
 * Resolves display text using a custom or default formatter.
 */
export function resolveSliderDisplayValue(
  value: number,
  index: number,
  formatter?: SliderValueFormatter,
): string {
  return (formatter ?? formatPlainValue)(value, index);
}
