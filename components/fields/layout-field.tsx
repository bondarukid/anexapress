import type { LayoutFieldProps } from "@/components/fields/types";
import { FieldControlShell } from "@/components/fields/utils/field-control-shell";
import { FieldSectionRenderer } from "@/components/fields/utils/field-section";
import { InputControl } from "@/components/fields/utils/input-control";
import { SelectControl } from "@/components/fields/utils/select-control";
import { ToggleGroup } from "@/components/fields/utils/toggle-control";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Layout field covering Kibo UI layouts-1…6 patterns.
 * https://www.kibo-ui.com/patterns/field/layouts
 */
export function LayoutField({
  variant = "vertical",
  containerClassName,
  legend,
  legendVariant = "legend",
  description,
  gridClassName,
  sections = [],
  fields = [],
  selects = [],
  toggles = [],
}: LayoutFieldProps) {
  if (variant === "nested") {
    return (
      <FieldSectionRenderer
        containerClassName={cn("w-full max-w-md", containerClassName)}
        sections={sections}
      />
    );
  }

  const resolvedOrientation =
    variant === "horizontal"
      ? "horizontal"
      : variant === "responsive"
        ? "responsive"
        : "vertical";

  const resolvedGridClassName =
    gridClassName ?? (variant === "grid" ? "grid grid-cols-2 gap-4" : undefined);

  return (
    <div className={cn("w-full max-w-md", containerClassName)}>
      <FieldSet>
        {legend ? <FieldLegend variant={legendVariant}>{legend}</FieldLegend> : null}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldGroup className={resolvedGridClassName}>
          {fields.map((field, index) => {
            const fieldId = field.id ?? `layout-field-${index}`;
            const fieldOrientation = field.orientation ?? resolvedOrientation;

            return (
              <FieldControlShell
                containerClassName="max-w-none"
                description={field.description}
                descriptionPlacement={field.descriptionPlacement ?? "below"}
                fieldClassName={field.gridClassName}
                id={fieldId}
                key={fieldId}
                label={field.label}
                labelClassName={
                  field.labelClassName ??
                  (fieldOrientation === "horizontal" ? "w-32" : undefined)
                }
                orientation={fieldOrientation}
              >
                <InputControl {...field} id={fieldId} />
              </FieldControlShell>
            );
          })}

          {selects.map((select, index) => {
            const selectId = select.id ?? `layout-select-${index}`;
            const selectOrientation = select.orientation ?? resolvedOrientation;

            return (
              <FieldControlShell
                containerClassName="max-w-none"
                description={select.description}
                descriptionPlacement={select.descriptionPlacement ?? "below"}
                id={selectId}
                key={selectId}
                label={select.label}
                labelClassName={select.labelClassName ?? (selectOrientation === "horizontal" ? "w-32" : undefined)}
                orientation={selectOrientation}
              >
                <SelectControl {...select} id={selectId} />
              </FieldControlShell>
            );
          })}
        </FieldGroup>

        {variant === "mixedOrientations" && toggles.length > 0 ? (
          <FieldGroup className="mt-4">
            <ToggleGroup kind="checkbox" options={toggles} />
          </FieldGroup>
        ) : null}
      </FieldSet>
    </div>
  );
}
