import type { BaseFieldControlProps, FieldSelectConfig, FieldSelectGroup, FieldSelectOption } from "@/components/fields/types/field.types";

export type SelectFieldVariant =
  | "simple"
  | "withDescription"
  | "withGroups"
  | "multiple"
  | "helperAbove"
  | "horizontal"
  | "defaultValue";

export type SelectFieldProps = BaseFieldControlProps &
  FieldSelectConfig & {
    variant?: SelectFieldVariant;
    selects?: FieldSelectConfig[];
    options?: FieldSelectOption[];
    groups?: FieldSelectGroup[];
    triggerClassName?: string;
  };
