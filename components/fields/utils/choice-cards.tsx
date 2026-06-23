import type { FieldChoiceCard } from "@/components/fields/types/field.types";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ChoiceCardsProps = {
  label: string;
  description?: string;
  choices: FieldChoiceCard[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  containerClassName?: string;
};

/**
 * Choice cards pattern using RadioGroup and card-style FieldLabels.
 */
export function ChoiceCards({
  label,
  description,
  choices,
  defaultValue,
  onValueChange,
  containerClassName,
}: ChoiceCardsProps) {
  return (
    <div className={containerClassName}>
      <FieldGroup>
        <FieldSet>
          <FieldLabel htmlFor={choices[0]?.id}>{label}</FieldLabel>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <RadioGroup defaultValue={defaultValue} onValueChange={onValueChange}>
            {choices.map((choice) => (
              <FieldLabel className="bg-background" htmlFor={choice.id} key={choice.id}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{choice.title}</FieldTitle>
                    {choice.description ? (
                      <FieldDescription>{choice.description}</FieldDescription>
                    ) : null}
                  </FieldContent>
                  <RadioGroupItem id={choice.id} value={choice.value} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
