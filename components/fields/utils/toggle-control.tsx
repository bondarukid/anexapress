import type { FieldToggleOption } from "@/components/fields/types/field.types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ToggleControlKind = "checkbox" | "radio" | "switch";

type ToggleControlProps = {
  kind: ToggleControlKind;
  option: FieldToggleOption;
  orientation?: "vertical" | "horizontal" | "responsive";
  showDescription?: boolean;
  labelClassName?: string;
};

/**
 * Checkbox, radio, or switch control inside a Field row.
 */
export function ToggleControl({
  kind,
  option,
  orientation = "horizontal",
  showDescription = false,
  labelClassName,
}: ToggleControlProps) {
  const controlId = option.id;

  if (kind === "switch") {
    return (
      <Field orientation={orientation}>
        <Switch defaultChecked={option.defaultChecked} disabled={option.disabled} id={controlId} />
        {showDescription && option.description ? (
          <FieldContent>
            <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
              {option.label}
            </FieldLabel>
            <FieldDescription>{option.description}</FieldDescription>
          </FieldContent>
        ) : (
          <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
            {option.label}
          </FieldLabel>
        )}
      </Field>
    );
  }

  if (kind === "radio") {
    return (
      <Field orientation={orientation}>
        <RadioGroupItem disabled={option.disabled} id={controlId} value={option.value ?? controlId} />
        {showDescription && option.description ? (
          <FieldContent>
            <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
              {option.label}
            </FieldLabel>
            <FieldDescription>{option.description}</FieldDescription>
          </FieldContent>
        ) : (
          <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
            {option.label}
          </FieldLabel>
        )}
      </Field>
    );
  }

  return (
    <Field orientation={orientation}>
      <Checkbox
        defaultChecked={option.defaultChecked}
        disabled={option.disabled}
        id={controlId}
      />
      {showDescription && option.description ? (
        <FieldContent>
          <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
            {option.label}
          </FieldLabel>
          <FieldDescription>{option.description}</FieldDescription>
        </FieldContent>
      ) : (
        <FieldLabel className={cn("font-normal", labelClassName)} htmlFor={controlId}>
          {option.label}
        </FieldLabel>
      )}
    </Field>
  );
}

type ToggleGroupProps = {
  kind: ToggleControlKind;
  options: FieldToggleOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  showDescription?: boolean;
  labelClassName?: string;
};

/**
 * Renders a list of toggle controls inside RadioGroup or FieldGroup.
 */
export function ToggleGroup({
  kind,
  options,
  defaultValue,
  onValueChange,
  showDescription = false,
  labelClassName,
}: ToggleGroupProps) {
  if (kind === "radio") {
    return (
      <RadioGroup defaultValue={defaultValue} onValueChange={onValueChange}>
        {options.map((option) => (
          <ToggleControl
            key={option.id}
            kind="radio"
            labelClassName={labelClassName}
            option={option}
            showDescription={showDescription}
          />
        ))}
      </RadioGroup>
    );
  }

  const content = options.map((option) => (
    <ToggleControl
      key={option.id}
      kind={kind}
      labelClassName={labelClassName}
      option={option}
      showDescription={showDescription}
    />
  ));

  return <>{content}</>;
}
