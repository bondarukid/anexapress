"use client";

import type { FieldControlShellProps } from "@/components/fields/types/field.types";
import { FieldShellContext } from "@/components/fields/utils/field-shell-context";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Shared field wrapper for Kibo UI field patterns.
 */
export function FieldControlShell({
  id = "input",
  label,
  title,
  description,
  descriptionPlacement = "below",
  orientation = "vertical",
  labelClassName,
  invalid = false,
  disabled = false,
  containerClassName,
  headerTrailing,
  children,
  error,
  fieldClassName,
  useFieldTitle = false,
}: FieldControlShellProps) {
  const showHeader = Boolean(label) || Boolean(title) || Boolean(headerTrailing);
  const showDescriptionAbove = descriptionPlacement === "above" && Boolean(description);
  const showDescriptionBelow = descriptionPlacement === "below" && Boolean(description);
  const headerLabel = useFieldTitle && title ? title : label;
  const labelId = headerLabel ? getFieldLabelId(id) : undefined;

  return (
    <div className={cn("w-full max-w-md", containerClassName)}>
      <FieldShellContext.Provider value={{ controlId: id, labelId }}>
        <Field
          className={fieldClassName}
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          orientation={orientation}
        >
          {showHeader ? (
            <div
              className={cn(
                "flex w-full items-center",
                orientation === "horizontal" ? "w-32 shrink-0" : "justify-between",
              )}
            >
              {headerLabel ? (
                <FieldLabel className={labelClassName} htmlFor={id} id={labelId}>
                  {headerLabel}
                </FieldLabel>
              ) : null}
              {headerTrailing}
            </div>
          ) : null}

          {showDescriptionAbove ? <FieldDescription>{description}</FieldDescription> : null}

          {children}

          {showDescriptionBelow ? <FieldDescription>{description}</FieldDescription> : null}

          {error ? <FieldError>{error}</FieldError> : null}
        </Field>
      </FieldShellContext.Provider>
    </div>
  );
}
