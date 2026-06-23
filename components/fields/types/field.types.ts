import type { ReactNode } from "react";

export type FieldDescriptionPlacement = "above" | "below";

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

export type BaseFieldControlProps = {
  id?: string;
  label?: string;
  description?: ReactNode;
  descriptionPlacement?: FieldDescriptionPlacement;
  orientation?: FieldOrientation;
  labelClassName?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  containerClassName?: string;
};

export type FieldInputConfig = BaseFieldControlProps & {
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  rows?: number;
  gridClassName?: string;
  fieldClassName?: string;
};

export type FieldSelectOption = {
  value: string;
  label: string;
  group?: string;
};

export type FieldSelectGroup = {
  label: string;
  options: FieldSelectOption[];
};

export type FieldSelectConfig = BaseFieldControlProps & {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  options?: FieldSelectOption[];
  groups?: FieldSelectGroup[];
  triggerClassName?: string;
  gridClassName?: string;
  fieldClassName?: string;
};

export type FieldTextareaConfig = BaseFieldControlProps & {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  rows?: number;
  maxLength?: number;
  textareaClassName?: string;
  gridClassName?: string;
  fieldClassName?: string;
};

export type FieldToggleOption = {
  id: string;
  label: string;
  description?: string;
  value?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
};

export type FieldChoiceCard = {
  id: string;
  value: string;
  title: string;
  description?: string;
};

export type FieldSectionConfig = {
  legend?: string;
  legendVariant?: "legend" | "label";
  label?: string;
  description?: string;
  separator?: string;
  orientation?: FieldOrientation;
  gridClassName?: string;
  groupClassName?: string;
  checkboxGroup?: boolean;
  fields?: FieldInputConfig[];
  selects?: FieldSelectConfig[];
  textareas?: FieldTextareaConfig[];
  toggles?: FieldToggleOption[];
  nestedGroups?: FieldSectionConfig[];
};

export type FieldControlShellProps = BaseFieldControlProps & {
  title?: string;
  headerTrailing?: ReactNode;
  children: ReactNode;
  error?: ReactNode;
  fieldClassName?: string;
  useFieldTitle?: boolean;
};

export type SliderFieldProps = {
  title: string;
  ariaLabel: string;
  min?: number;
  max?: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  description?: ReactNode;
  className?: string;
  sliderClassName?: string;
};
