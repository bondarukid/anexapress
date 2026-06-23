import type {
  FieldChoiceCard,
  FieldSectionConfig,
  FieldToggleOption,
} from "@/components/fields/types/field.types";

export type AdvancedFieldVariant =
  | "simpleSlider"
  | "rangeSlider"
  | "choiceCards"
  | "fieldsetLegend"
  | "fieldGroupSeparator"
  | "complexForm"
  | "mixedTypes";

export type AdvancedFieldProps = {
  variant?: AdvancedFieldVariant;
  containerClassName?: string;
  title?: string;
  label?: string;
  description?: string;
  legend?: string;
  separatorLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number[];
  value?: number[];
  onValueChange?: (value: number[]) => void;
  choices?: FieldChoiceCard[];
  defaultChoice?: string;
  onChoiceChange?: (value: string) => void;
  sections?: FieldSectionConfig[];
  fields?: FieldSectionConfig["fields"];
  toggles?: FieldToggleOption[];
};
