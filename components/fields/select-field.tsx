import type { SelectFieldProps } from "@/components/fields/types";
import { FieldControlShell } from "@/components/fields/utils/field-control-shell";
import { SelectControl } from "@/components/fields/utils/select-control";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Select field covering Kibo UI selects-1…7 patterns.
 * https://www.kibo-ui.com/patterns/field/selects
 */
export function SelectField({
  variant = "simple",
  id = "select",
  label,
  description,
  descriptionPlacement,
  orientation,
  labelClassName,
  placeholder,
  defaultValue,
  value,
  disabled,
  invalid,
  containerClassName,
  triggerClassName,
  options = [],
  groups = [],
  selects = [],
}: SelectFieldProps) {
  if (variant === "multiple") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <FieldSet>
          <FieldGroup>
            {selects.map((select, index) => {
              const selectId = select.id ?? `select-field-${index}`;

              return (
                <FieldControlShell
                  containerClassName="max-w-none"
                  description={select.description}
                  descriptionPlacement={select.descriptionPlacement ?? "below"}
                  disabled={select.disabled}
                  id={selectId}
                  invalid={select.invalid}
                  key={selectId}
                  label={select.label}
                  labelClassName={select.labelClassName}
                  orientation={select.orientation}
                >
                  <SelectControl {...select} id={selectId} triggerClassName={triggerClassName} />
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
    (variant === "helperAbove" ? "above" : variant === "withDescription" || variant === "defaultValue" ? "below" : "below");

  const resolvedOrientation = orientation ?? (variant === "horizontal" ? "horizontal" : "vertical");
  const resolvedLabelClassName =
    labelClassName ?? (variant === "horizontal" ? "w-32" : undefined);

  const resolvedGroups = variant === "withGroups" ? groups : [];
  const resolvedOptions = resolvedGroups.length > 0 ? [] : options;

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
      <SelectControl
        defaultValue={variant === "defaultValue" ? defaultValue : defaultValue}
        disabled={disabled}
        groups={resolvedGroups}
        id={id}
        options={resolvedOptions}
        placeholder={placeholder}
        triggerClassName={triggerClassName}
        value={value}
      />
    </FieldControlShell>
  );
}
