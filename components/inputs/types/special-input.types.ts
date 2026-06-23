import type { LucideIcon } from "lucide-react";

import type { BaseInputProps } from "@/components/inputs/types/input.types";

export type SpecialInputVariant =
  | "fileUploadList"
  | "timeInput"
  | "rangeWithValue"
  | "disabled"
  | "currency";

export type SpecialInputProps = BaseInputProps & {
  variant?: SpecialInputVariant;
  icon?: LucideIcon;
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  accept?: string;
  rangeMinLabel?: string;
  rangeMaxLabel?: string;
  valueLabelFormatter?: (value: number) => string;
  onFilesChange?: (files: File[]) => void;
};
