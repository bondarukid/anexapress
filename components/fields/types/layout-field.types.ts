import type { FieldInputConfig, FieldSectionConfig, FieldSelectConfig, FieldToggleOption } from "@/components/fields/types/field.types";

export type LayoutFieldVariant =
  | "vertical"
  | "horizontal"
  | "responsive"
  | "grid"
  | "nested"
  | "mixedOrientations";

export type LayoutFieldProps = {
  variant?: LayoutFieldVariant;
  containerClassName?: string;
  legend?: string;
  legendVariant?: "legend" | "label";
  description?: string;
  gridClassName?: string;
  sections?: FieldSectionConfig[];
  fields?: FieldInputConfig[];
  selects?: FieldSelectConfig[];
  toggles?: FieldToggleOption[];
};
