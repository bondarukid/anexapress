import type { ComponentProps, ReactNode } from "react";

import type { Input } from "@/components/ui/input";

export type BaseInputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  description?: string;
  helperText?: string;
  inputProps?: Omit<
    ComponentProps<typeof Input>,
    "value" | "defaultValue" | "onChange" | "id" | "disabled" | "required"
  >;
};

export type ValidationRule = {
  text: string;
  validate: (value: string) => boolean;
};

export type ValidationStatus = "error" | "success" | "warning";

export type InputFieldShellProps = {
  id?: string;
  label?: ReactNode;
  description?: string;
  helperText?: string;
  requiredHint?: string;
  orientation?: "vertical" | "horizontal";
  labelClassName?: string;
  invalid?: boolean;
  containerClassName?: string;
  headerTrailing?: ReactNode;
  children: ReactNode;
};
