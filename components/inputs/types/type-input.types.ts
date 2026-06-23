import type { LucideIcon } from "lucide-react";

import type { BaseInputProps } from "@/components/inputs/types/input.types";

export type TypeInputVariant =
  | "email"
  | "passwordToggle"
  | "numberControls"
  | "search"
  | "date"
  | "phone"
  | "url";

export type TypeInputProps = BaseInputProps & {
  variant?: TypeInputVariant;
  icon?: LucideIcon;
  min?: number;
  max?: number;
  step?: number;
};
