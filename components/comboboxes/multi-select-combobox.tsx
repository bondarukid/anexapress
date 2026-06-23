"use client";

import { Button } from "@/components/ui/button";
import { CommandGroup, CommandSeparator } from "@/components/ui/command";
import type { MultiSelectComboboxProps } from "@/components/comboboxes/types";
import {
  DEFAULT_PERMISSION_OPTIONS,
  DEFAULT_TAG_OPTIONS,
  findComboboxLabel,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxCheckItem, ComboboxPlainItems } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  ComboboxSelectedBadges,
  toggleMultiValue,
  useComboboxMultiValue,
  useComboboxOpenState,
} from "@/components/comboboxes/utils/combobox-selection";
import { cn } from "@/lib/utils";

/**
 * Configurable multi-select combobox covering Kibo UI combobox-multi-select-1…7.
 * https://www.kibo-ui.com/patterns/combobox/multi-select
 */
export function MultiSelectCombobox({
  variant = "multipleItemsWithBadges",
  placeholder = "Select tags...",
  searchPlaceholder = "Search tags...",
  emptyMessage = "No tag found.",
  className,
  containerClassName,
  contentClassName,
  disabled,
  options = DEFAULT_TAG_OPTIONS,
  open: controlledOpen,
  onOpenChange,
  values: controlledValues,
  defaultValues,
  onValuesChange,
  maxSelections = 3,
  showSelectAll,
  showClearAll,
  showCheckboxes,
  selectAllLabel = "Select All",
  clearAllLabel = "Clear All",
  maxSelectionsMessage,
}: MultiSelectComboboxProps) {
  const resolvedOptions =
    variant === "withSelectAllOption" ? DEFAULT_PERMISSION_OPTIONS : options;

  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { values, setValues } = useComboboxMultiValue(
    controlledValues,
    onValuesChange,
    defaultValues ?? [],
  );

  const allSelected = values.length === resolvedOptions.length;

  const handleToggle = (currentValue: string) => {
    if (
      variant === "withMaxSelectionsLimit" &&
      !values.includes(currentValue) &&
      values.length >= maxSelections
    ) {
      return;
    }
    setValues(toggleMultiValue(values, currentValue));
  };

  const triggerContent = (() => {
    if (variant === "withItemCountInTrigger") {
      return values.length > 0
        ? `${values.length} item(s) selected`
        : (placeholder ?? "Select items...");
    }
    if (variant === "multipleItemsWithBadges" || variant === "withCheckboxesVisible") {
      return (
        <ComboboxSelectedBadges
          onRemove={(item) => setValues(values.filter((value) => value !== item))}
          options={resolvedOptions}
          placeholder={placeholder}
          values={values}
        />
      );
    }
    return values.length > 0
      ? `${values.length} selected`
      : (placeholder ?? "Select...");
  })();

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <ComboboxPopoverShell
        contentClassName={cn("w-full", contentClassName)}
        onOpenChange={setOpen}
        open={open}
        trigger={
          <ComboboxTriggerButton
            className={className}
            disabled={disabled}
            fullWidth={variant === "multipleItemsWithBadges"}
            open={open}
            widthClassName="w-[250px]"
          >
            {triggerContent}
          </ComboboxTriggerButton>
        }
      >
        <ComboboxCommandList emptyMessage={emptyMessage} searchPlaceholder={searchPlaceholder}>
          {(showSelectAll ?? variant === "withSelectAllOption") ? (
            <>
              <CommandGroup>
                <ComboboxCheckItem
                  onSelect={() => {
                    setValues(allSelected ? [] : resolvedOptions.map((option) => option.value));
                  }}
                  option={selectAllLabel}
                  selected={allSelected}
                >
                  <span className="font-medium">{selectAllLabel}</span>
                </ComboboxCheckItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}

          {(showClearAll ?? variant === "withClearAllFunctionality") && values.length > 0 ? (
            <div className="border-b p-2">
              <Button
                className="h-7 w-full text-xs"
                onClick={() => setValues([])}
                size="sm"
                type="button"
                variant="ghost"
              >
                {clearAllLabel}
              </Button>
            </div>
          ) : null}

          <ComboboxPlainItems
            multi
            onSelect={handleToggle}
            options={resolvedOptions}
            selectedValues={values}
            showCheckbox={showCheckboxes ?? variant === "withCheckboxesVisible"}
          />

          {variant === "withMaxSelectionsLimit" ? (
            <div className="border-t p-2 text-muted-foreground text-xs">
              {maxSelectionsMessage ?? `${values.length}/${maxSelections} selected`}
            </div>
          ) : null}
        </ComboboxCommandList>
      </ComboboxPopoverShell>

      {variant === "selectedItemsListBelow" && values.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-md border p-2 text-sm">
          {values.map((item) => (
            <li className="flex items-center justify-between" key={item}>
              <span>{findComboboxLabel(resolvedOptions, item) ?? item}</span>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => setValues(values.filter((value) => value !== item))}
                size="sm"
                type="button"
                variant="ghost"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
