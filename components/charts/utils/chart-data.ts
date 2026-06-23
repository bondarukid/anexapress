import type { TimeRangeFilter, TimeRangeOption } from "@/components/charts/types";

const TIME_RANGE_DAYS: Record<TimeRangeOption, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/**
 * Filters chart data by a date-based time range (Kibo interactive patterns).
 */
export function filterDataByTimeRange(
  data: Record<string, unknown>[],
  filter: TimeRangeFilter,
): Record<string, unknown>[] {
  const range = filter.value ?? filter.default ?? "90d";
  const referenceDate = new Date(filter.referenceDate ?? getLatestDate(data, filter.key));
  const daysToSubtract = TIME_RANGE_DAYS[range];
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return data.filter((item) => {
    const raw = item[filter.key];
    if (typeof raw !== "string" && typeof raw !== "number") {
      return true;
    }
    const date = new Date(raw);
    return date >= startDate;
  });
}

function getLatestDate(data: Record<string, unknown>[], key: string): string {
  const dates = data
    .map((item) => item[key])
    .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
    .map((value) => new Date(value).getTime())
    .filter((time) => !Number.isNaN(time));

  if (dates.length === 0) {
    return new Date().toISOString();
  }

  return new Date(Math.max(...dates)).toISOString();
}

/**
 * Shortens month names for compact axis ticks (Kibo default).
 */
export function formatMonthTick(value: string): string {
  return value.slice(0, 3);
}

/**
 * Formats ISO date strings for chart axis/tooltip labels.
 */
export function formatDateTick(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats weekday labels for tooltip demo patterns.
 */
export function formatWeekdayTick(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
  });
}
