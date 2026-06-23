import type { BasicInputFieldProps } from "@/components/fields/types";
import { FieldControlShell } from "@/components/fields/utils/field-control-shell";
import { FieldInputGroupRenderer } from "@/components/fields/utils/field-section";
import { InputControl } from "@/components/fields/utils/input-control";
import { cn } from "@/lib/utils";

/**
 * Basic input field covering Kibo UI basic-inputs-1…5 patterns.
 * https://www.kibo-ui.com/patterns/field/basic-inputs
 */
export function BasicInputField({
  variant = "label",
  id = "input",
  label,
  description,
  descriptionPlacement,
  orientation,
  labelClassName,
  placeholder,
  type = "text",
  defaultValue,
  value,
  disabled,
  invalid,
  containerClassName,
  inputClassName,
  fields = [],
  className,
}: BasicInputFieldProps) {
  if (variant === "multipleInGroup") {
    return (
      <FieldInputGroupRenderer
        containerClassName={cn("w-full max-w-md", containerClassName)}
        fields={fields}
      />
    );
  }

  const resolvedDescriptionPlacement =
    descriptionPlacement ??
    (variant === "descriptionAbove" ? "above" : variant === "descriptionBelow" ? "below" : "below");

  const resolvedOrientation = orientation ?? (variant === "horizontal" ? "horizontal" : "vertical");
  const resolvedLabelClassName =
    labelClassName ?? (variant === "horizontal" ? "w-32" : undefined);

  return (
    <FieldControlShell
      containerClassName={containerClassName}
      description={description}
      descriptionPlacement={resolvedDescriptionPlacement}
      disabled={disabled}
      id={id}
      invalid={invalid}
      label={label}
      labelClassName={resolvedLabelClassName}
      orientation={resolvedOrientation}
    >
      <InputControl
        className={className}
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        inputClassName={inputClassName}
        invalid={invalid}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </FieldControlShell>
  );
}
