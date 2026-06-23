import type { BaseFieldControlProps, FieldToggleOption } from "@/components/fields/types/field.types";

export type ToggleFieldVariant =
  | "simpleCheckbox"
  | "multipleCheckboxes"
  | "radio"
  | "radioWithDescriptions"
  | "simpleSwitch"
  | "switchWithDescription"
  | "checkboxWithDescription";

export type ToggleFieldProps = BaseFieldControlProps & {
  variant?: ToggleFieldVariant;
  legend?: string;
  legendVariant?: "legend" | "label";
  options?: FieldToggleOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  checkboxClassName?: string;
};
