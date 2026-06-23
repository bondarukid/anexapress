import type { ToggleFieldProps } from "@/components/fields/types";
import { ToggleControl, ToggleGroup } from "@/components/fields/utils/toggle-control";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Toggle field covering Kibo UI toggles-1…7 patterns.
 * https://www.kibo-ui.com/patterns/field/toggles
 */
export function ToggleField({
  variant = "simpleCheckbox",
  containerClassName,
  legend,
  legendVariant = "legend",
  label,
  description,
  options = [],
  defaultValue,
  onValueChange,
  labelClassName,
}: ToggleFieldProps) {
  const primaryOption = options[0];

  if (variant === "simpleCheckbox" && primaryOption) {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <ToggleControl kind="checkbox" labelClassName={labelClassName} option={primaryOption} />
      </div>
    );
  }

  if (variant === "simpleSwitch" && primaryOption) {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <Field orientation="horizontal">
          <FieldLabel htmlFor={primaryOption.id}>{primaryOption.label}</FieldLabel>
          <Switch
            defaultChecked={primaryOption.defaultChecked}
            disabled={primaryOption.disabled}
            id={primaryOption.id}
          />
        </Field>
      </div>
    );
  }

  if (variant === "switchWithDescription" && primaryOption) {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={primaryOption.id}>{primaryOption.label}</FieldLabel>
            {primaryOption.description ? (
              <FieldDescription>{primaryOption.description}</FieldDescription>
            ) : null}
          </FieldContent>
          <Switch
            defaultChecked={primaryOption.defaultChecked}
            disabled={primaryOption.disabled}
            id={primaryOption.id}
          />
        </Field>
      </div>
    );
  }

  if (variant === "checkboxWithDescription" && primaryOption) {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <ToggleControl
          kind="checkbox"
          option={primaryOption}
          showDescription
        />
      </div>
    );
  }

  if (variant === "multipleCheckboxes") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <FieldSet>
          {legend ? <FieldLegend variant={legendVariant}>{legend}</FieldLegend> : null}
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldGroup className="gap-3">
            <ToggleGroup kind="checkbox" options={options} />
          </FieldGroup>
        </FieldSet>
      </div>
    );
  }

  if (variant === "radio" || variant === "radioWithDescriptions") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <FieldSet>
          {label ? <FieldLabel>{label}</FieldLabel> : null}
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <ToggleGroup
            defaultValue={defaultValue}
            kind="radio"
            onValueChange={onValueChange}
            options={options}
            showDescription={variant === "radioWithDescriptions"}
          />
        </FieldSet>
      </div>
    );
  }

  return null;
}
