import {
  CircleIcon,
  LayoutGridIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SquareIcon,
  SunIcon,
  TriangleIcon,
} from "lucide-react";

import type {
  ComboboxGroupOption,
  ComboboxNestedGroupOption,
  ComboboxOption,
} from "@/components/comboboxes/types";

export const DEFAULT_FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: "next.js", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt.js", label: "Nuxt.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
];

export const DEFAULT_TAG_OPTIONS: ComboboxOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
];

export const DEFAULT_PERMISSION_OPTIONS: ComboboxOption[] = [
  { value: "read", label: "Read" },
  { value: "write", label: "Write" },
  { value: "delete", label: "Delete" },
  { value: "admin", label: "Admin" },
];

export const DEFAULT_THEME_OPTIONS: ComboboxOption[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

export const DEFAULT_WORKSPACE_OPTIONS: ComboboxOption[] = [
  { value: "personal", label: "Personal Workspace" },
  { value: "team", label: "Team Workspace" },
  { value: "company", label: "Company Workspace" },
];

export const DEFAULT_SERVICE_OPTIONS: ComboboxOption[] = [
  { value: "basic", label: "Basic" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium (Coming Soon)", disabled: true },
  { value: "enterprise", label: "Enterprise (Contact Sales)", disabled: true },
];

export const DEFAULT_CURRENCY_OPTIONS: ComboboxOption[] = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "jpy", label: "JPY" },
  { value: "cad", label: "CAD" },
];

export const DEFAULT_USER_OPTIONS: ComboboxOption[] = [
  {
    value: "haydenbleasel",
    label: "Hayden Bleasel",
    avatarUrl: "https://github.com/haydenbleasel.png",
    status: "online",
  },
  {
    value: "shadcn",
    label: "shadcn",
    avatarUrl: "https://github.com/shadcn.png",
    status: "busy",
  },
  {
    value: "leerob",
    label: "Lee Robinson",
    avatarUrl: "https://github.com/leerob.png",
    status: "offline",
  },
  {
    value: "rauchg",
    label: "Guillermo Rauch",
    avatarUrl: "https://github.com/rauchg.png",
    status: "online",
  },
];

export const DEFAULT_FRUIT_OPTIONS: ComboboxOption[] = [
  { value: "apple", label: "Apple", icon: CircleIcon, color: "#ef4444" },
  { value: "banana", label: "Banana", icon: TriangleIcon, color: "#eab308" },
  { value: "cherry", label: "Cherry", icon: SquareIcon, color: "#ec4899" },
  { value: "grape", label: "Grape", icon: PaletteIcon, color: "#8b5cf6" },
];

export const DEFAULT_TIMEZONE_GROUPS: ComboboxGroupOption[] = [
  {
    label: "North America",
    options: [
      { value: "est", label: "Eastern Standard Time (EST)" },
      { value: "cst", label: "Central Standard Time (CST)" },
      { value: "pst", label: "Pacific Standard Time (PST)" },
    ],
  },
  {
    label: "Europe",
    options: [
      { value: "gmt", label: "Greenwich Mean Time (GMT)" },
      { value: "cet", label: "Central European Time (CET)" },
    ],
  },
];

export const DEFAULT_CATEGORY_GROUPS: ComboboxGroupOption[] = [
  {
    label: "Fruits",
    options: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  {
    label: "Vegetables",
    options: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
    ],
  },
];

export const DEFAULT_DEPARTMENT_GROUPS: Record<string, ComboboxOption[]> = {
  Engineering: [
    { value: "software", label: "Software" },
    { value: "hardware", label: "Hardware" },
    { value: "qa", label: "QA" },
  ],
  Marketing: [
    { value: "content", label: "Content" },
    { value: "social", label: "Social Media" },
    { value: "seo", label: "SEO" },
  ],
};

export const DEFAULT_NESTED_GROUPS: ComboboxNestedGroupOption[] = [
  {
    label: "Design",
    options: [],
    children: [
      {
        label: "UI",
        options: [
          { value: "figma", label: "Figma" },
          { value: "sketch", label: "Sketch" },
        ],
      },
      {
        label: "Graphics",
        options: [
          { value: "photoshop", label: "Photoshop" },
          { value: "illustrator", label: "Illustrator" },
        ],
      },
    ],
  },
];

export const DEFAULT_PRODUCT_OPTIONS: ComboboxOption[] = [
  {
    value: "reporting",
    label: "Emissions Reporting",
    description: "Compliance-ready emissions records",
    metadata: "12k users",
    icon: LayoutGridIcon,
  },
  {
    value: "design",
    label: "Design Studio",
    description: "Collaborative design tools",
    metadata: "8k users",
    icon: PaletteIcon,
  },
  {
    value: "deploy",
    label: "Deploy Cloud",
    description: "One-click deployments",
    metadata: "24k users",
    icon: CircleIcon,
  },
];

export const DEFAULT_RECENT_OPTIONS = ["React", "TypeScript", "Tailwind CSS"];

export const DEFAULT_FAVORITE_OPTIONS: ComboboxOption[] = [
  { value: "home", label: "Home", favorite: true },
  { value: "settings", label: "Settings", favorite: true },
  { value: "profile", label: "Profile" },
  { value: "billing", label: "Billing" },
];

export function findComboboxOption(
  options: ComboboxOption[],
  value: string,
): ComboboxOption | undefined {
  return options.find((option) => option.value === value);
}

export function findComboboxLabel(options: ComboboxOption[], value: string): string | undefined {
  return findComboboxOption(options, value)?.label;
}

export function flattenComboboxGroups(groups: ComboboxGroupOption[]): ComboboxOption[] {
  return groups.flatMap((group) => group.options);
}

export function flattenNestedGroups(groups: ComboboxNestedGroupOption[]): ComboboxOption[] {
  return groups.flatMap((group) => [
    ...group.options,
    ...(group.children?.flatMap((child) => child.options) ?? []),
  ]);
}

export function flattenDepartmentGroups(
  departments: Record<string, ComboboxOption[]>,
): ComboboxOption[] {
  return Object.values(departments).flat();
}
