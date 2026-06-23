"use client";

import type { FieldTextareaConfig } from "@/components/fields/types/field.types";
import { useFieldShellA11y } from "@/components/fields/utils/field-shell-context";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type TextareaControlProps = FieldTextareaConfig & {
  onChange?: (value: string) => void;
  textareaClassName?: string;
};

/**
 * Textarea control with Kibo background styling.
 */
export function TextareaControl({
  id,
  placeholder,
  defaultValue,
  value,
  rows = 4,
  maxLength,
  disabled,
  invalid,
  className,
  textareaClassName,
  onChange,
}: TextareaControlProps) {
  const shellA11y = useFieldShellA11y();
  const labelId = shellA11y?.labelId;

  return (
    <Textarea
      aria-invalid={invalid || undefined}
      aria-label={!labelId && placeholder ? placeholder : undefined}
      aria-labelledby={labelId}
      className={cn("bg-background", textareaClassName, className)}
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      maxLength={maxLength}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      placeholder={placeholder}
      rows={rows}
      value={value}
    />
  );
}
