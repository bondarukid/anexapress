import type { BaseInputProps, ValidationRule } from "@/components/inputs/types/input.types";

export type ValidationInputVariant =
  | "error"
  | "success"
  | "warning"
  | "multipleMessages"
  | "realtimeValidation";

export type ValidationInputProps = BaseInputProps & {
  variant?: ValidationInputVariant;
  message?: string;
  messages?: string[];
  rules?: ValidationRule[];
};
