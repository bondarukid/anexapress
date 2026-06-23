"use client";

import { useState } from "react";

import type { AdvancedFieldProps } from "@/components/fields/types";
import { ChoiceCards } from "@/components/fields/utils/choice-cards";
import {
  FieldInputGroupRenderer,
  FieldSectionRenderer,
} from "@/components/fields/utils/field-section";
import { SliderField } from "@/components/fields/utils/slider-field";
import { cn } from "@/lib/utils";

/**
 * Advanced field covering Kibo UI advanced-1…7 patterns.
 * https://www.kibo-ui.com/patterns/field/advanced
 */
export function AdvancedField({
  variant = "simpleSlider",
  containerClassName,
  title = "Volume",
  label = "Compute Environment",
  description,
  legend,
  separatorLabel,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = [50],
  value: valueProp,
  onValueChange,
  choices = [],
  defaultChoice,
  onChoiceChange,
  sections = [],
  fields = [],
}: AdvancedFieldProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const sliderValue = valueProp ?? internalValue;

  const handleSliderChange = (nextValue: number[]) => {
    if (valueProp === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  if (variant === "simpleSlider") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <SliderField
          ariaLabel={title}
          description={
            <>
              Current volume: <span className="font-medium">{sliderValue[0]}%</span>
            </>
          }
          max={max}
          min={min}
          onValueChange={handleSliderChange}
          step={step}
          title={title}
          value={sliderValue}
        />
      </div>
    );
  }

  if (variant === "rangeSlider") {
    return (
      <div className={cn("w-full max-w-md", containerClassName)}>
        <SliderField
          ariaLabel={title}
          description={
            <>
              Set your budget range ($
              <span className="font-medium tabular-nums">{sliderValue[0]}</span> -{" "}
              <span className="font-medium tabular-nums">{sliderValue[1]}</span>).
            </>
          }
          max={max}
          min={min}
          onValueChange={handleSliderChange}
          step={step}
          title={title}
          value={sliderValue}
        />
      </div>
    );
  }

  if (variant === "choiceCards") {
    return (
      <ChoiceCards
        choices={choices}
        containerClassName={cn("w-full max-w-md", containerClassName)}
        defaultValue={defaultChoice}
        description={description}
        label={label}
        onValueChange={onChoiceChange}
      />
    );
  }

  if (variant === "fieldsetLegend") {
    const section = sections[0];
    return (
      <FieldInputGroupRenderer
        containerClassName={cn("w-full max-w-md", containerClassName)}
        description={section?.description ?? description}
        fields={section?.fields ?? fields}
        gridClassName={section?.gridClassName ?? "grid grid-cols-2 gap-4 [&>*:first-child]:col-span-2"}
        legend={section?.legend ?? legend}
      />
    );
  }

  if (variant === "fieldGroupSeparator" || variant === "complexForm" || variant === "mixedTypes") {
    const resolvedSections =
      sections.length > 0
        ? sections
        : variant === "mixedTypes"
          ? [
              {
                label: "Contact Information",
                description,
                fields,
              },
              {
                separator: separatorLabel ?? "Additional Details",
                textareas: [],
              },
            ]
          : [];

    return (
      <FieldSectionRenderer
        containerClassName={cn("w-full max-w-md", containerClassName)}
        sections={resolvedSections}
      />
    );
  }

  return null;
}
