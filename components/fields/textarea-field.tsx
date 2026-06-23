"use client";

import { useState } from "react";

import type { TextareaFieldProps } from "@/components/fields/types";
import { FieldControlShell } from "@/components/fields/utils/field-control-shell";
import { TextareaControl } from "@/components/fields/utils/textarea-control";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Textarea field covering Kibo UI text-areas-1…6 patterns.
 * https://www.kibo-ui.com/patterns/field/text-areas
 */
export function TextareaField({
  variant = "simple",
  id = "textarea",
  label,
  description,
  descriptionPlacement,
  orientation,
  labelClassName,
  placeholder,
  defaultValue,
  value: valueProp,
  onChange,
  rows = 4,
  maxLength = 500,
  disabled,
  invalid,
  containerClassName,
  textareaClassName,
  textareas = [],
}: TextareaFieldProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const value = valueProp ?? internalValue;

  const handleChange = (nextValue: string) => {
    if (valueProp === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  if (variant === "multipleSizes") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <FieldSet>
          <FieldGroup>
            {textareas.map((textarea, index) => {
              const textareaId = textarea.id ?? `textarea-field-${index}`;

              return (
                <FieldControlShell
                  containerClassName="max-w-none"
                  description={textarea.description}
                  descriptionPlacement={textarea.descriptionPlacement ?? "below"}
                  disabled={textarea.disabled}
                  id={textareaId}
                  invalid={textarea.invalid}
                  key={textareaId}
                  label={textarea.label}
                  labelClassName={textarea.labelClassName}
                  orientation={textarea.orientation}
                >
                  <TextareaControl
                    {...textarea}
                    id={textareaId}
                    textareaClassName={textareaClassName}
                  />
                </FieldControlShell>
              );
            })}
          </FieldGroup>
        </FieldSet>
      </div>
    );
  }

  const resolvedDescriptionPlacement =
    descriptionPlacement ??
    (variant === "helperAbove" || variant === "detailedInstructions"
      ? "above"
      : variant === "withDescription"
        ? "below"
        : "below");

  const counterDescription =
    variant === "characterCount" ? (
      <>
        {value.length}/{maxLength} characters
      </>
    ) : undefined;

  return (
    <FieldControlShell
      containerClassName={containerClassName}
      description={variant === "characterCount" ? counterDescription : description}
      descriptionPlacement={resolvedDescriptionPlacement}
      disabled={disabled}
      id={id}
      invalid={invalid}
      label={label}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      <TextareaControl
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        invalid={invalid}
        maxLength={variant === "characterCount" ? maxLength : undefined}
        onChange={variant === "characterCount" ? handleChange : onChange ? handleChange : undefined}
        placeholder={placeholder}
        rows={rows}
        textareaClassName={textareaClassName}
        value={variant === "characterCount" ? value : valueProp}
      />
    </FieldControlShell>
  );
}
