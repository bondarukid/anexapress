import type { BaseFieldControlProps, FieldInputConfig, FieldSectionConfig } from "@/components/fields/types/field.types";

export type BasicInputFieldVariant =
  | "label"
  | "descriptionBelow"
  | "descriptionAbove"
  | "multipleInGroup"
  | "horizontal";

export type BasicInputFieldProps = BaseFieldControlProps &
  FieldInputConfig & {
    variant?: BasicInputFieldVariant;
    fields?: FieldInputConfig[];
    sections?: FieldSectionConfig[];
    inputClassName?: string;
  };
