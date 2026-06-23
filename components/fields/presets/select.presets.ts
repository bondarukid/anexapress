import type { SelectFieldProps } from "@/components/fields/types";

/**
 * Kibo UI select field pattern presets.
 * https://www.kibo-ui.com/patterns/field/selects
 */
export const selectPresets = {
  simple: {
    variant: "simple",
    id: "framework",
    label: "Framework",
    placeholder: "Select framework",
    options: [
      { value: "next", label: "Next.js" },
      { value: "vite", label: "Vite" },
      { value: "remix", label: "Remix" },
    ],
  },
  withDescription: {
    variant: "withDescription",
    id: "language",
    label: "Language",
    placeholder: "Select language",
    description: "Choose your preferred language.",
    options: [
      { value: "en", label: "English" },
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
    ],
  },
  withGroups: {
    variant: "withGroups",
    id: "timezone",
    label: "Timezone",
    placeholder: "Select timezone",
    description: "Choose your local timezone.",
    groups: [
      {
        label: "North America",
        options: [
          { value: "est", label: "Eastern Time" },
          { value: "cst", label: "Central Time" },
          { value: "mst", label: "Mountain Time" },
          { value: "pst", label: "Pacific Time" },
        ],
      },
      {
        label: "Europe",
        options: [
          { value: "gmt", label: "London" },
          { value: "cet", label: "Central Europe" },
          { value: "eet", label: "Eastern Europe" },
        ],
      },
    ],
  },
  multiple: {
    variant: "multiple",
    selects: [
      {
        id: "country-multi",
        label: "Country",
        placeholder: "Select country",
        options: [
          { value: "us", label: "United States" },
          { value: "uk", label: "United Kingdom" },
        ],
      },
      {
        id: "state-multi",
        label: "State",
        placeholder: "Select state",
        options: [
          { value: "ca", label: "California" },
          { value: "ny", label: "New York" },
        ],
      },
    ],
  },
  helperAbove: {
    variant: "helperAbove",
    id: "priority",
    label: "Priority",
    placeholder: "Select priority",
    description: "Higher priority items are processed first.",
    descriptionPlacement: "above",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  horizontal: {
    variant: "horizontal",
    id: "sort-by",
    label: "Sort By",
    placeholder: "Select sort",
    orientation: "horizontal",
    labelClassName: "w-32",
    options: [
      { value: "name", label: "Name" },
      { value: "date", label: "Date" },
      { value: "status", label: "Status" },
    ],
  },
  defaultValue: {
    variant: "defaultValue",
    id: "status",
    label: "Status",
    defaultValue: "active",
    description: "Current account status.",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "suspended", label: "Suspended" },
      { value: "inactive", label: "Inactive" },
    ],
  },
} satisfies Record<string, Partial<SelectFieldProps>>;
