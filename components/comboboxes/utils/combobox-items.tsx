"use client";

import type { ReactNode } from "react";

import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import type { ComboboxGroupOption, ComboboxOption } from "@/components/comboboxes/types";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const comboboxItemClassName = "[&>svg.ml-auto]:hidden";

type ComboboxCheckItemProps = {
  option: ComboboxOption | string;
  selected: boolean;
  onSelect: (value: string) => void;
  className?: string;
  children?: ReactNode;
  showCheckbox?: boolean;
};

export function ComboboxCheckItem({
  option,
  selected,
  onSelect,
  className,
  children,
  showCheckbox,
}: ComboboxCheckItemProps) {
  const value = typeof option === "string" ? option : option.value;
  const label = typeof option === "string" ? option : option.label;
  const disabled = typeof option === "string" ? false : option.disabled;

  return (
    <CommandItem
      className={cn(comboboxItemClassName, disabled && "opacity-50", className)}
      disabled={disabled}
      onSelect={(currentValue) => {
        if (disabled) {
          return;
        }
        onSelect(currentValue);
      }}
      value={value}
    >
      <CheckIcon
        className={cn(
          showCheckbox ? "opacity-100" : selected ? "opacity-100" : "opacity-0",
          "mr-2 size-4",
        )}
      />
      {children ?? label}
    </CommandItem>
  );
}

type ComboboxGroupSectionProps = {
  group: ComboboxGroupOption;
  selectedValue?: string;
  selectedValues?: string[];
  onSelect: (value: string) => void;
  showCount?: boolean;
  heading?: ReactNode;
  multi?: boolean;
};

export function ComboboxGroupSection({
  group,
  selectedValue,
  selectedValues = [],
  onSelect,
  showCount,
  heading,
  multi,
}: ComboboxGroupSectionProps) {
  return (
    <CommandGroup
      heading={
        heading ?? (
          <span className="flex w-full items-center justify-between">
            <span>{group.label}</span>
            {showCount ? (
              <span className="text-muted-foreground text-xs">{group.options.length}</span>
            ) : null}
          </span>
        )
      }
    >
      {group.options.map((option) => (
        <ComboboxCheckItem
          key={option.value}
          onSelect={onSelect}
          option={option}
          selected={
            multi ? selectedValues.includes(option.value) : selectedValue === option.value
          }
        />
      ))}
    </CommandGroup>
  );
}

export function ComboboxGroupSections({
  groups,
  selectedValue,
  selectedValues,
  onSelect,
  showCount,
  multi,
  withSeparators,
}: {
  groups: ComboboxGroupOption[];
  selectedValue?: string;
  selectedValues?: string[];
  onSelect: (value: string) => void;
  showCount?: boolean;
  multi?: boolean;
  withSeparators?: boolean;
}) {
  return (
    <>
      {groups.map((group, index) => (
        <div key={group.label}>
          <ComboboxGroupSection
            group={group}
            multi={multi}
            onSelect={onSelect}
            selectedValue={selectedValue}
            selectedValues={selectedValues}
            showCount={showCount}
          />
          {withSeparators && index < groups.length - 1 ? <CommandSeparator /> : null}
        </div>
      ))}
    </>
  );
}

export function ComboboxPlainItems({
  options,
  selectedValue,
  selectedValues,
  onSelect,
  multi,
  showCheckbox,
}: {
  options: ComboboxOption[] | string[];
  selectedValue?: string;
  selectedValues?: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
  showCheckbox?: boolean;
}) {
  return (
    <CommandGroup>
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const selected = multi
          ? selectedValues?.includes(value)
          : selectedValue === value;

        return (
          <ComboboxCheckItem
            key={value}
            onSelect={onSelect}
            option={option}
            selected={Boolean(selected)}
            showCheckbox={showCheckbox}
          />
        );
      })}
    </CommandGroup>
  );
}
