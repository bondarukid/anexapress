"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { findComboboxLabel } from "@/components/comboboxes/utils/combobox-data";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  filterTimezoneOptions,
  formatTimezoneLabel,
  getFlatTimezoneOptions,
  resolveTimezoneSelection,
} from "@/lib/timezone/timezone-options";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

export type TimezoneFieldProps = {
  id?: string;
  label?: string;
  description?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Searchable IANA timezone picker for workspace and profile settings.
 * Renders a filtered subset of zones so the popover stays responsive inside dialogs.
 */
export function TimezoneField({
  id = "timezone",
  label = "Timezone",
  description,
  value,
  onValueChange,
  disabled = false,
  className,
}: TimezoneFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = useMemo(() => getFlatTimezoneOptions(), []);

  const visibleOptions = useMemo(
    () => filterTimezoneOptions(options, search, value),
    [options, search, value],
  );

  const selectedLabel =
    findComboboxLabel(options, value) ?? (value ? formatTimezoneLabel(value) : null);

  const labelId = label ? getFieldLabelId(id) : undefined;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  };

  return (
    <Field className={className}>
      {label ? (
        <FieldLabel htmlFor={id} id={labelId}>
          {label}
        </FieldLabel>
      ) : null}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-labelledby={labelId}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">{selectedLabel ?? "Select timezone"}</span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[200] w-[min(24rem,calc(100vw-2rem))] p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false} className={cn(!open && "hidden")}>
            <CommandInput
              placeholder="Search timezones..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup
                heading={search.trim() ? "Results" : "Popular timezones — type to search all"}
              >
                {visibleOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(selectedValue) => {
                      const resolved = resolveTimezoneSelection(options, selectedValue);
                      if (resolved) {
                        onValueChange(resolved);
                      }
                      handleOpenChange(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}
