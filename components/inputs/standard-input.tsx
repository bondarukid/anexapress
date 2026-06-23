"use client";

import { Input } from "@/components/ui/input";
import type { StandardInputProps } from "@/components/inputs/types";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { InputFieldShell } from "@/components/inputs/utils/input-field-shell";
import { useControllableInput } from "@/components/inputs/utils/use-controllable-input";
import { cn } from "@/lib/utils";

/**
 * Standard input covering Kibo UI standard-1…7 patterns.
 * https://www.kibo-ui.com/patterns/input/standard
 */
export function StandardInput({
  variant = "label",
  id = "input",
  label,
  placeholder,
  value: valueProp,
  defaultValue,
  onChange,
  disabled,
  required,
  description,
  helperText,
  maxLength = 50,
  optionalLabel = "(optional)",
  requiredHint = "* Required field",
  labelClassName,
  className,
  containerClassName,
  inputClassName,
  inputProps,
}: StandardInputProps) {
  const { value, setValue } = useControllableInput({
    value: valueProp,
    defaultValue,
    onChange,
  });

  const resolvedLabel =
    variant === "required" ? (
      <>
        {label} <span className="text-destructive">*</span>
      </>
    ) : variant === "optional" ? (
      <>
        {label}{" "}
        <span className="font-normal text-muted-foreground text-xs">{optionalLabel}</span>
      </>
    ) : (
      label
    );

  const headerTrailing =
    variant === "characterCounter" ? (
      <span className="text-muted-foreground text-xs">
        {value.length}/{maxLength}
      </span>
    ) : undefined;

  const labelId = resolvedLabel ? getFieldLabelId(id) : undefined;

  const inputElement = (
    <Input
      aria-invalid={undefined}
      aria-label={!labelId && placeholder ? placeholder : undefined}
      aria-labelledby={labelId}
      className={cn("bg-background", inputClassName, className)}
      disabled={disabled}
      id={id}
      maxLength={variant === "characterCounter" ? maxLength : inputProps?.maxLength}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      required={variant === "required" ? true : required}
      value={value}
      {...inputProps}
    />
  );

  if (variant === "inlineLabel") {
    return (
      <InputFieldShell
        containerClassName={cn("max-w-sm", containerClassName)}
        id={id}
        label={resolvedLabel}
        labelClassName={cn("w-24 text-right", labelClassName)}
        orientation="horizontal"
      >
        <div className="flex-1">{inputElement}</div>
      </InputFieldShell>
    );
  }

  return (
    <InputFieldShell
      containerClassName={containerClassName}
      description={variant === "description" ? description : undefined}
      headerTrailing={headerTrailing}
      helperText={
        variant === "helperText"
          ? helperText
          : variant === "required"
            ? requiredHint
            : undefined
      }
      id={id}
      label={resolvedLabel}
      labelClassName={labelClassName}
    >
      {inputElement}
    </InputFieldShell>
  );
}
