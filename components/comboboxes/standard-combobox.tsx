"use client";

import type { StandardComboboxProps } from "@/components/comboboxes/types";
import {
  DEFAULT_FRAMEWORK_OPTIONS,
  DEFAULT_THEME_OPTIONS,
  findComboboxLabel,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxPlainItems } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  useComboboxOpenState,
  useComboboxSingleValue,
} from "@/components/comboboxes/utils/combobox-selection";
import { cn } from "@/lib/utils";

/**
 * Configurable standard combobox covering Kibo UI combobox-standard-1…7.
 * https://www.kibo-ui.com/patterns/combobox/standard
 */
export function StandardCombobox({
  variant = "simpleSingleSelect",
  placeholder = "Select framework...",
  searchPlaceholder = "Search framework...",
  emptyMessage = "No framework found.",
  className,
  containerClassName,
  contentClassName,
  disabled,
  options = DEFAULT_FRAMEWORK_OPTIONS,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  defaultValue,
  onValueChange,
  size = "default",
  fullWidth,
  triggerWidthClassName,
}: StandardComboboxProps) {
  const resolvedDefault =
    variant === "withDefaultSelectedValue" ? (defaultValue ?? "next.js") : (defaultValue ?? "");
  const resolvedOptions = variant === "withItemIcons" ? DEFAULT_THEME_OPTIONS : options;
  const resolvedPlaceholder =
    variant === "withItemIcons" ? (placeholder ?? "Select theme...") : placeholder;
  const resolvedSearchPlaceholder =
    variant === "withItemIcons" ? (searchPlaceholder ?? "Search theme...") : searchPlaceholder;
  const resolvedEmptyMessage =
    variant === "withItemIcons" ? (emptyMessage ?? "No theme found.") : emptyMessage;

  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { value, setValue } = useComboboxSingleValue(
    controlledValue,
    onValueChange,
    resolvedDefault,
  );

  const isDisabled = disabled ?? variant === "disabledState";
  const isFullWidth = fullWidth ?? variant === "fullWidthVariant";
  const resolvedSize =
    variant === "smallSizeVariant" ? "sm" : variant === "largeSizeVariant" ? "lg" : size;
  const widthClassName =
    triggerWidthClassName ??
    (variant === "smallSizeVariant"
      ? "w-[180px]"
      : variant === "largeSizeVariant"
        ? "w-[280px]"
        : variant === "fullWidthVariant"
          ? "w-full"
          : "w-[200px]");

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const selectedLabel = findComboboxLabel(resolvedOptions, value);
  const selectedOption = resolvedOptions.find((option) => option.value === value);
  const SelectedIcon = selectedOption?.icon;

  return (
    <ComboboxPopoverShell
      containerClassName={containerClassName}
      contentClassName={cn(contentClassName, isFullWidth && "w-full")}
      onOpenChange={setOpen}
      open={open}
      trigger={
        <ComboboxTriggerButton
          className={className}
          disabled={isDisabled}
          fullWidth={isFullWidth}
          open={open}
          size={resolvedSize}
          widthClassName={widthClassName}
        >
          {selectedLabel ? (
            variant === "withItemIcons" && SelectedIcon ? (
              <span className="flex items-center gap-2">
                <SelectedIcon className="size-4 shrink-0" />
                {selectedLabel}
              </span>
            ) : (
              selectedLabel
            )
          ) : (
            resolvedPlaceholder
          )}
        </ComboboxTriggerButton>
      }
    >
      <ComboboxCommandList
        emptyMessage={resolvedEmptyMessage}
        searchPlaceholder={resolvedSearchPlaceholder}
      >
        <ComboboxPlainItems
          onSelect={handleSelect}
          options={resolvedOptions}
          selectedValue={value}
        />
      </ComboboxCommandList>
    </ComboboxPopoverShell>
  );
}
