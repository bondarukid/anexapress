"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WithStatesComboboxProps } from "@/components/comboboxes/types";
import type { ComboboxOption } from "@/components/comboboxes/types";
import {
  DEFAULT_CURRENCY_OPTIONS,
  DEFAULT_SERVICE_OPTIONS,
  findComboboxLabel,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxPlainItems } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  useComboboxLoadingOnOpen,
  useComboboxOpenState,
  useComboboxSingleValue,
} from "@/components/comboboxes/utils/combobox-selection";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, InboxIcon, PlusIcon, RefreshCwIcon } from "lucide-react";

const DEFAULT_LOADED_OPTIONS = ["Option 1", "Option 2", "Option 3"];

/**
 * Configurable with-states combobox covering Kibo UI combobox-with-states-1…7.
 * https://www.kibo-ui.com/patterns/combobox/with-states
 */
export function WithStatesCombobox({
  variant = "loadingState",
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  containerClassName,
  contentClassName,
  disabled,
  options,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  defaultValue,
  onValueChange,
  isLoading,
  error,
  errorDescription = "Could not fetch data",
  onRetry,
  retryLabel = "Retry",
  validationMessage,
  readOnly,
  emptyActionLabel = "Create Item",
  emptyTitle = "No items yet",
  emptyDescription = "Get started by creating your first item",
  onEmptyAction,
  emptyItems,
  noResultsHint = "Try a different search term",
}: WithStatesComboboxProps) {
  const resolvedOptions: ComboboxOption[] =
    options ??
    (variant === "withDisabledItems"
      ? DEFAULT_SERVICE_OPTIONS
      : variant === "withValidationFeedback"
        ? DEFAULT_CURRENCY_OPTIONS
        : DEFAULT_LOADED_OPTIONS.map((item) => ({
            value: item.toLowerCase().replace(/\s+/g, "-"),
            label: item,
          })));

  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { value, setValue } = useComboboxSingleValue(controlledValue, onValueChange, defaultValue ?? "");
  const { loading, handleOpen } = useComboboxLoadingOnOpen(isLoading);

  const [hasError, setHasError] = useState(variant === "errorStateWithRetry");
  const [items, setItems] = useState<string[]>(emptyItems ?? []);
  const [search, setSearch] = useState("");

  const validationError =
    variant === "withValidationFeedback"
      ? value
        ? ""
        : (validationMessage ?? "Please select a currency")
      : "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (variant === "loadingState") {
      handleOpen(nextOpen);
    }
    setOpen(nextOpen);
  };

  const handleSelect = (currentValue: string) => {
    if (readOnly ?? variant === "readOnlyViewMode") {
      return;
    }
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    setHasError(false);
  };

  const handleEmptyAction = () => {
    if (onEmptyAction) {
      onEmptyAction();
    } else {
      setItems(["New Item 1", "New Item 2", "New Item 3"]);
    }
  };

  const selectedLabel = findComboboxLabel(resolvedOptions, value);

  const isReadOnly = readOnly ?? variant === "readOnlyViewMode";
  const filteredNoResults =
    variant === "noResultsVariation"
      ? DEFAULT_LOADED_OPTIONS.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
      : [];

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      <ComboboxPopoverShell
        contentClassName={contentClassName}
        onOpenChange={handleOpenChange}
        open={open}
        trigger={
          <ComboboxTriggerButton
            className={cn(
              className,
              validationError && variant === "withValidationFeedback" && "border-destructive",
            )}
            disabled={disabled ?? isReadOnly}
            open={open}
            widthClassName="w-[250px]"
          >
            {isReadOnly ? (
              selectedLabel ?? value ?? "Read-only selection"
            ) : (
              selectedLabel ?? value ?? placeholder
            )}
          </ComboboxTriggerButton>
        }
      >
        <ComboboxCommandList
          commandInputProps={variant === "noResultsVariation" ? { onValueChange: setSearch, value: search } : undefined}
          emptyMessage={emptyMessage}
          hideEmpty={
            variant === "loadingState" ||
            variant === "errorStateWithRetry" ||
            variant === "emptyStateWithAction"
          }
          searchPlaceholder={searchPlaceholder}
        >
          {variant === "loadingState" && loading ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-8 w-full" key={index} />
              ))}
            </div>
          ) : null}

          {variant === "errorStateWithRetry" && hasError ? (
            <div className="flex flex-col items-center gap-3 p-4 text-center">
              <AlertCircleIcon className="size-8 text-destructive" />
              <div>
                <p className="font-medium text-sm">{error ?? "Failed to load"}</p>
                <p className="text-muted-foreground text-xs">{errorDescription}</p>
              </div>
              <Button className="w-full" onClick={handleRetry} size="sm" type="button" variant="outline">
                <RefreshCwIcon className="mr-2 size-3" />
                {retryLabel}
              </Button>
            </div>
          ) : null}

          {variant === "emptyStateWithAction" && items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <InboxIcon className="size-12 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{emptyTitle}</p>
                <p className="text-muted-foreground text-xs">{emptyDescription}</p>
              </div>
              <Button className="w-full" onClick={handleEmptyAction} size="sm" type="button">
                <PlusIcon className="mr-2 size-4" />
                {emptyActionLabel}
              </Button>
            </div>
          ) : null}

          {variant === "noResultsVariation" ? (
            search && filteredNoResults.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="font-medium text-sm">{emptyMessage}</p>
                <p className="text-muted-foreground text-xs">{noResultsHint}</p>
              </div>
            ) : (
              <ComboboxPlainItems
                onSelect={handleSelect}
                options={filteredNoResults}
                selectedValue={value}
              />
            )
          ) : null}

          {variant === "withDisabledItems" ||
          variant === "withValidationFeedback" ||
          (variant === "loadingState" && !loading) ||
          (variant === "errorStateWithRetry" && !hasError) ||
          (variant === "emptyStateWithAction" && items.length > 0) ||
          variant === "readOnlyViewMode" ? (
            <ComboboxPlainItems
              onSelect={handleSelect}
              options={
                variant === "emptyStateWithAction"
                  ? items
                  : resolvedOptions
              }
              selectedValue={value}
            />
          ) : null}
        </ComboboxCommandList>
      </ComboboxPopoverShell>

      {validationError && variant === "withValidationFeedback" ? (
        <p className="text-destructive text-xs">{validationError}</p>
      ) : null}
    </div>
  );
}
