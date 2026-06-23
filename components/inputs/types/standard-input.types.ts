import type { BaseInputProps } from "@/components/inputs/types/input.types";

export type StandardInputVariant =
  | "label"
  | "description"
  | "helperText"
  | "required"
  | "optional"
  | "characterCounter"
  | "inlineLabel";

export type StandardInputProps = BaseInputProps & {
  variant?: StandardInputVariant;
  maxLength?: number;
  optionalLabel?: string;
  requiredHint?: string;
  labelClassName?: string;
};
