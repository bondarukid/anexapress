import type { BaseFieldControlProps, FieldTextareaConfig } from "@/components/fields/types/field.types";

export type TextareaFieldVariant =
  | "simple"
  | "withDescription"
  | "characterCount"
  | "helperAbove"
  | "multipleSizes"
  | "detailedInstructions";

export type TextareaFieldProps = BaseFieldControlProps &
  FieldTextareaConfig & {
    variant?: TextareaFieldVariant;
    textareas?: FieldTextareaConfig[];
    maxLength?: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    textareaClassName?: string;
  };
