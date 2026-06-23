"use client";

import type { InputFieldShellProps } from "@/components/inputs/types/input.types";
import { FieldShellContext } from "@/components/fields/utils/field-shell-context";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Shared field wrapper for Kibo UI input patterns.
 */
export function InputFieldShell({
  id = "input",
  label,
  description,
  helperText,
  requiredHint,
  orientation = "vertical",
  labelClassName,
  invalid = false,
  containerClassName,
  headerTrailing,
  children,
}: InputFieldShellProps) {
  const showHeader = Boolean(label) || Boolean(headerTrailing);
  const labelId = label ? getFieldLabelId(id) : undefined;

  return (
    <div className={cn("w-full max-w-sm", containerClassName)}>
      <FieldShellContext.Provider value={{ controlId: id, labelId }}>
        <Field data-invalid={invalid || undefined} orientation={orientation}>
          {showHeader ? (
            <div
              className={cn(
                "flex w-full items-center",
                orientation === "horizontal" ? "w-24 shrink-0 justify-end" : "justify-between",
              )}
            >
              {label ? (
                <FieldLabel className={labelClassName} htmlFor={id} id={labelId}>
                  {label}
                </FieldLabel>
              ) : null}
              {headerTrailing}
            </div>
          ) : null}

          {description ? <FieldDescription>{description}</FieldDescription> : null}

          {children}

          {helperText ? (
            <FieldDescription className="text-xs">{helperText}</FieldDescription>
          ) : null}

          {requiredHint ? (
            <FieldDescription className="text-xs">{requiredHint}</FieldDescription>
          ) : null}
        </Field>
      </FieldShellContext.Provider>
    </div>
  );
}
