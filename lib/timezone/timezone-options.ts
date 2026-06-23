import type { ComboboxGroupOption, ComboboxOption } from "@/components/comboboxes/types";
import { flattenComboboxGroups } from "@/components/comboboxes/utils/combobox-data";

export const FALLBACK_TIMEZONE = "UTC";

export const POPULAR_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

const CURATED_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Kiev",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

function listSupportedTimezones(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    return Intl.supportedValuesOf("timeZone");
  }
  return [...CURATED_TIMEZONES];
}

const SUPPORTED_TIMEZONE_SET = new Set(listSupportedTimezones());

/** Flat set of valid IANA timezone identifiers for Zod refine checks. */
export const TIMEZONE_VALUES = SUPPORTED_TIMEZONE_SET;

export type TimezoneOptionGroup = {
  label: string;
  options: Array<{ value: string; label: string }>;
};

function getTimezoneOffsetLabel(timezone: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offset = parts.find((part) => part.type === "timeZoneName")?.value;
    return offset ?? "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Human-readable label for an IANA timezone (city name + UTC offset).
 */
export function formatTimezoneLabel(timezone: string): string {
  const city = timezone.includes("/") ? timezone.split("/").slice(1).join("/").replace(/_/g, " ") : timezone;
  const offset = getTimezoneOffsetLabel(timezone);
  return `${city} (${offset})`;
}

/** Whether the value is a supported IANA timezone identifier. */
export function isValidTimezone(timezone: string): boolean {
  return TIMEZONE_VALUES.has(timezone);
}

function groupTimezonesByRegion(timezones: string[]): TimezoneOptionGroup[] {
  const groups = new Map<string, Array<{ value: string; label: string }>>();

  for (const timezone of timezones) {
    const region = timezone.includes("/") ? timezone.split("/")[0] : "Other";
    const options = groups.get(region) ?? [];
    options.push({ value: timezone, label: formatTimezoneLabel(timezone) });
    groups.set(region, options);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => {
      if (left === "UTC") return -1;
      if (right === "UTC") return 1;
      return left.localeCompare(right);
    })
    .map(([label, options]) => ({
      label,
      options: options.sort((left, right) => left.label.localeCompare(right.label)),
    }));
}

let cachedTimezoneGroups: ComboboxGroupOption[] | null = null;

/** Grouped IANA timezone options for combobox UI. */
export function buildIanaTimezoneGroups(): ComboboxGroupOption[] {
  if (cachedTimezoneGroups) {
    return cachedTimezoneGroups;
  }

  const timezones = listSupportedTimezones().slice().sort((left, right) => left.localeCompare(right));
  cachedTimezoneGroups = groupTimezonesByRegion(timezones);
  return cachedTimezoneGroups;
}

/** Flattened timezone options for searchable pickers. */
export function getFlatTimezoneOptions(): ComboboxOption[] {
  return flattenComboboxGroups(buildIanaTimezoneGroups());
}

/**
 * Options shown before the user types a search query.
 * Keeps the popover responsive instead of rendering every IANA zone at once.
 */
export function getDefaultTimezoneOptions(
  options: ComboboxOption[],
  currentValue: string,
): ComboboxOption[] {
  const byValue = new Map(options.map((option) => [option.value, option]));
  const selected: ComboboxOption[] = [];

  const add = (timezone: string) => {
    const option = byValue.get(timezone);
    if (option && !selected.some((item) => item.value === option.value)) {
      selected.push(option);
    }
  };

  add(currentValue);
  for (const timezone of POPULAR_TIMEZONES) {
    add(timezone);
  }

  if (selected.length > 0) {
    return selected;
  }

  return options.slice(0, 12);
}

export function filterTimezoneOptions(
  options: ComboboxOption[],
  search: string,
  currentValue: string,
): ComboboxOption[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return getDefaultTimezoneOptions(options, currentValue);
  }

  return options
    .filter(
      (option) =>
        option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query),
    )
    .slice(0, 80);
}

/** Resolve cmdk's lowercased selection back to the canonical IANA timezone id. */
export function resolveTimezoneSelection(
  options: ComboboxOption[],
  selectedValue: string,
): string | null {
  const match = options.find((option) => option.value.toLowerCase() === selectedValue.toLowerCase());
  return match?.value ?? null;
}

/**
 * Detect browser timezone on the client; falls back to UTC when unavailable.
 * Call only from client components/effects.
 */
export function detectBrowserTimezone(): string {
  if (typeof Intl === "undefined") {
    return FALLBACK_TIMEZONE;
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && isValidTimezone(timezone)) {
      return timezone;
    }
  } catch {
    // Fall through to default.
  }

  return FALLBACK_TIMEZONE;
}
