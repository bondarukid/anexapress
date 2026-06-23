"use client";

import type { FieldInputConfig } from "@/components/fields/types/field.types";
import { useFieldShellA11y } from "@/components/fields/utils/field-shell-context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputControlProps = FieldInputConfig & {
  inputClassName?: string;
};

/**
 * Input control with Kibo background styling.
 */
export function InputControl({
  id,
  type = "text",
  placeholder,
  defaultValue,
  value,
  disabled,
  invalid,
  className,
  inputClassName,
}: InputControlProps) {
  const shellA11y = useFieldShellA11y();
  const labelId = shellA11y?.labelId;

  return (
    <Input
      aria-invalid={invalid || undefined}
      aria-label={!labelId && placeholder ? placeholder : undefined}
      aria-labelledby={labelId}
      className={cn("bg-background", inputClassName, className)}
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}
