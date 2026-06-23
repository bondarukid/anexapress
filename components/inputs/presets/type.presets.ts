import type { TypeInputProps } from "@/components/inputs/types";

/**
 * Kibo UI type input pattern presets.
 */
export const typePresets = {
  email: {
    variant: "email",
    id: "email-input",
    label: "Email Address",
    placeholder: "you@example.com",
  },
  passwordToggle: {
    variant: "passwordToggle",
    id: "password-toggle",
    label: "Password",
    placeholder: "Enter your password",
  },
  numberControls: {
    variant: "numberControls",
    id: "quantity",
    label: "Quantity",
    defaultValue: 1,
    min: 1,
  },
  search: {
    variant: "search",
    id: "search-input",
    label: "Search",
    placeholder: "Search...",
  },
  date: {
    variant: "date",
    id: "date-input",
    label: "Date of Birth",
  },
  phone: {
    variant: "phone",
    id: "phone-input",
    label: "Phone Number",
    placeholder: "+1 (555) 000-0000",
    helperText: "Format: +1 (555) 000-0000",
  },
  url: {
    variant: "url",
    id: "url-input",
    label: "Website",
    placeholder: "https://example.com",
    helperText: "Include https:// or http://",
  },
} satisfies Record<string, Partial<TypeInputProps>>;
