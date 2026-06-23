"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CommandGroup, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import type { CustomActionsComboboxProps } from "@/components/comboboxes/types";
import {
  DEFAULT_RECENT_OPTIONS,
  DEFAULT_TAG_OPTIONS,
  DEFAULT_THEME_OPTIONS,
  DEFAULT_WORKSPACE_OPTIONS,
  findComboboxLabel,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxCheckItem, ComboboxPlainItems } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxFooterActions,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  useAsyncComboboxSearch,
  useComboboxOpenState,
  useComboboxSingleValue,
} from "@/components/comboboxes/utils/combobox-selection";
import { ChevronsUpDownIcon, Loader2Icon, PlusIcon, SettingsIcon, XIcon } from "lucide-react";

const DEFAULT_SHORTCUTS = [
  { label: "Calendar", shortcut: "⌘K" },
  { label: "Search", shortcut: "⌘F" },
  { label: "Settings", shortcut: "⌘," },
];

const DEFAULT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

/**
 * Configurable custom-actions combobox covering Kibo UI combobox-custom-actions-1…7.
 * https://www.kibo-ui.com/patterns/combobox/custom-actions
 */
export function CustomActionsCombobox({
  variant = "createNewOptionInline",
  placeholder,
  searchPlaceholder,
  emptyMessage,
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
  recentOptions = DEFAULT_RECENT_OPTIONS,
  recentGroupLabel = "Recent",
  footerActions,
  filters = DEFAULT_FILTERS,
  shortcuts = DEFAULT_SHORTCUTS,
  isLoading,
  onCreate,
  onSearch,
  searchResults,
  showClear,
  onClear,
  createLabel = "Create",
}: CustomActionsComboboxProps) {
  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { value, setValue } = useComboboxSingleValue(
    controlledValue,
    onValueChange,
    defaultValue ?? (variant === "withFooterActions" ? "personal" : variant === "clearResetButton" ? "system" : ""),
  );

  const [items, setItems] = useState<string[]>(
    variant === "createNewOptionInline" ? ["Tag 1", "Tag 2", "Tag 3"] : [],
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]?.value ?? "all");
  const { isSearching, results } = useAsyncComboboxSearch(
    search,
    onSearch,
    isLoading,
  );

  const displayResults = searchResults ?? results;

  const resolvedOptions = useMemo(() => {
    if (options) {
      return options;
    }
    if (variant === "withFooterActions") {
      return DEFAULT_WORKSPACE_OPTIONS;
    }
    if (variant === "clearResetButton") {
      return DEFAULT_THEME_OPTIONS;
    }
    if (variant === "withQuickFilters") {
      return DEFAULT_TAG_OPTIONS;
    }
    return DEFAULT_TAG_OPTIONS;
  }, [options, variant]);

  const resolvedPlaceholder =
    placeholder ??
    (variant === "createNewOptionInline"
      ? "Select or create tag..."
      : variant === "asyncDynamicSearch"
        ? "Search dynamically..."
        : variant === "withFooterActions"
          ? "Select workspace..."
          : variant === "clearResetButton"
            ? "Select theme..."
            : "Select...");

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const handleCreate = () => {
    if (!search) {
      return;
    }
    if (onCreate) {
      onCreate(search);
    } else {
      setItems((prev) => (prev.includes(search) ? prev : [...prev, search]));
      setValue(search);
    }
    setOpen(false);
    setSearch("");
  };

  const stringOptions =
    variant === "createNewOptionInline"
      ? items
      : variant === "asyncDynamicSearch"
        ? displayResults
        : resolvedOptions.map((option) => option.value);

  const triggerLabel =
    variant === "createNewOptionInline"
      ? value || resolvedPlaceholder
      : variant === "asyncDynamicSearch"
        ? value || resolvedPlaceholder
        : findComboboxLabel(resolvedOptions, value) ?? resolvedPlaceholder;

  const clearButton =
    (showClear ?? variant === "clearResetButton") && value ? (
      <div className="ml-2 flex items-center gap-1">
        <button
          className="rounded-sm hover:bg-accent"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (onClear) {
              onClear();
            }
            setValue("");
          }}
          type="button"
        >
          <XIcon className="size-4 opacity-50 hover:opacity-100" />
        </button>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </div>
    ) : undefined;

  return (
    <ComboboxPopoverShell
      commandProps={variant === "asyncDynamicSearch" ? { shouldFilter: false } : undefined}
      containerClassName={containerClassName}
      contentClassName={contentClassName}
      onOpenChange={setOpen}
      open={open}
      trigger={
        <ComboboxTriggerButton
          className={className}
          disabled={disabled}
          open={open}
          trailing={clearButton}
          widthClassName="w-[250px]"
        >
          {triggerLabel}
        </ComboboxTriggerButton>
      }
    >
      <ComboboxCommandList
        commandInputProps={
          variant === "createNewOptionInline" || variant === "asyncDynamicSearch"
            ? { onValueChange: setSearch, value: search }
            : undefined
        }
        emptyMessage={emptyMessage ?? "No results found."}
        hideEmpty={variant === "asyncDynamicSearch" && (isSearching || !search)}
        searchPlaceholder={
          searchPlaceholder ??
          (variant === "createNewOptionInline"
            ? "Search or create..."
            : variant === "asyncDynamicSearch"
              ? "Type to search..."
              : "Search...")
        }
      >
        {variant === "withQuickFilters" ? (
          <div className="flex gap-1 border-b p-2">
            {filters.map((filter) => (
              <Button
                className="h-7 text-xs"
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                size="sm"
                type="button"
                variant={activeFilter === filter.value ? "default" : "ghost"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        ) : null}

        {variant === "asyncDynamicSearch" ? (
          isSearching ? (
            <div className="flex items-center justify-center p-4">
              <Loader2Icon className="size-4 animate-spin" />
              <span className="ml-2 text-muted-foreground text-sm">Searching...</span>
            </div>
          ) : (
            <>
              {!search ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Start typing to search
                </div>
              ) : null}
              {search && displayResults.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  {emptyMessage ?? "No results found."}
                </div>
              ) : null}
              {displayResults.length > 0 ? (
                <ComboboxPlainItems
                  onSelect={handleSelect}
                  options={displayResults}
                  selectedValue={value}
                />
              ) : null}
            </>
          )
        ) : null}

        {variant === "createNewOptionInline" ? (
          <>
            {search && !items.includes(search) && items.length === 0 ? (
              <div className="p-2">
                <Button
                  className="w-full justify-start"
                  onClick={handleCreate}
                  type="button"
                  variant="ghost"
                >
                  <PlusIcon className="mr-2 size-4" />
                  {createLabel} &quot;{search}&quot;
                </Button>
              </div>
            ) : null}
            <ComboboxPlainItems
              onSelect={handleSelect}
              options={stringOptions}
              selectedValue={value}
            />
            {search && !items.includes(search) && items.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <ComboboxCheckItem onSelect={handleCreate} option={search} selected={false}>
                    <PlusIcon className="mr-2 size-4" />
                    {createLabel} &quot;{search}&quot;
                  </ComboboxCheckItem>
                </CommandGroup>
              </>
            ) : null}
          </>
        ) : null}

        {variant === "recentSelectionsSection" ? (
          <>
            <CommandGroup heading={recentGroupLabel}>
              {recentOptions.map((item) => (
                <ComboboxCheckItem
                  key={item}
                  onSelect={handleSelect}
                  option={item}
                  selected={value === item}
                />
              ))}
            </CommandGroup>
            <CommandSeparator />
            <ComboboxPlainItems
              onSelect={handleSelect}
              options={resolvedOptions}
              selectedValue={value}
            />
          </>
        ) : null}

        {variant === "keyboardShortcutsDisplayed" ? (
          <CommandGroup>
            {shortcuts.map((item) => (
              <ComboboxCheckItem
                key={item.label}
                onSelect={() => setOpen(false)}
                option={item.label}
                selected={false}
              >
                {item.label}
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </ComboboxCheckItem>
            ))}
          </CommandGroup>
        ) : null}

        {variant === "withFooterActions" ||
        variant === "clearResetButton" ||
        variant === "withQuickFilters" ? (
          <ComboboxPlainItems
            onSelect={handleSelect}
            options={resolvedOptions}
            selectedValue={value}
          />
        ) : null}
      </ComboboxCommandList>

      {variant === "withFooterActions" ? (
        <>
          <CommandSeparator />
          <ComboboxFooterActions
            actions={
              footerActions ?? [
                {
                  label: "Manage Workspaces",
                  icon: SettingsIcon,
                  onClick: () => setOpen(false),
                },
              ]
            }
          />
        </>
      ) : null}
    </ComboboxPopoverShell>
  );
}
