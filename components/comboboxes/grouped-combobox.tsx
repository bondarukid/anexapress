"use client";

import { useMemo, useState } from "react";

import { CommandGroup } from "@/components/ui/command";
import type { GroupedComboboxProps } from "@/components/comboboxes/types";
import {
  DEFAULT_CATEGORY_GROUPS,
  DEFAULT_DEPARTMENT_GROUPS,
  DEFAULT_FAVORITE_OPTIONS,
  DEFAULT_NESTED_GROUPS,
  DEFAULT_RECENT_OPTIONS,
  DEFAULT_TIMEZONE_GROUPS,
  findComboboxLabel,
  flattenComboboxGroups,
  flattenDepartmentGroups,
  flattenNestedGroups,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxCheckItem, ComboboxGroupSections } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  useComboboxOpenState,
  useComboboxSingleValue,
} from "@/components/comboboxes/utils/combobox-selection";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

/**
 * Configurable grouped combobox covering Kibo UI combobox-grouped-1…7.
 * https://www.kibo-ui.com/patterns/combobox/grouped
 */
export function GroupedCombobox({
  variant = "multipleGroupsWithLabels",
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  containerClassName,
  contentClassName,
  disabled,
  groups,
  nestedGroups = DEFAULT_NESTED_GROUPS,
  open: controlledOpen,
  onOpenChange,
  value: controlledValue,
  defaultValue,
  onValueChange,
  recentGroupLabel = "Recent",
  allGroupLabel = "All Items",
  favoritesGroupLabel = "Favorites",
  showCounts,
}: GroupedComboboxProps) {
  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { value, setValue } = useComboboxSingleValue(controlledValue, onValueChange, defaultValue ?? "");

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ Marketing: true });

  const resolvedGroups = useMemo(() => {
    if (groups) {
      return groups;
    }
    if (variant === "categoriesWithSeparators") {
      return DEFAULT_CATEGORY_GROUPS;
    }
    if (variant === "groupsWithItemCounts") {
      return DEFAULT_TIMEZONE_GROUPS;
    }
    return DEFAULT_TIMEZONE_GROUPS;
  }, [groups, variant]);

  const flatOptions = useMemo(() => {
    if (variant === "collapsibleGroups") {
      return flattenDepartmentGroups(DEFAULT_DEPARTMENT_GROUPS);
    }
    if (variant === "nestedHierarchicalGroups") {
      return flattenNestedGroups(nestedGroups);
    }
    if (variant === "favoritesPlusAllItems") {
      return DEFAULT_FAVORITE_OPTIONS;
    }
    return flattenComboboxGroups(resolvedGroups);
  }, [nestedGroups, resolvedGroups, variant]);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const selectedLabel = findComboboxLabel(flatOptions, value);

  return (
    <ComboboxPopoverShell
      containerClassName={containerClassName}
      contentClassName={contentClassName}
      onOpenChange={setOpen}
      open={open}
      trigger={
        <ComboboxTriggerButton
          className={className}
          disabled={disabled}
          open={open}
          widthClassName="w-[250px]"
        >
          {selectedLabel ?? placeholder}
        </ComboboxTriggerButton>
      }
    >
      <ComboboxCommandList emptyMessage={emptyMessage} searchPlaceholder={searchPlaceholder}>
        {variant === "nestedHierarchicalGroups"
          ? nestedGroups.map((group) => (
              <CommandGroup heading={group.label} key={group.label}>
                {group.children?.map((child) => (
                  <div key={child.label}>
                    <div className="px-2 py-1 text-muted-foreground text-xs">{child.label}</div>
                    {child.options.map((option) => (
                      <ComboboxCheckItem
                        key={option.value}
                        onSelect={handleSelect}
                        option={option}
                        selected={value === option.value}
                      />
                    ))}
                  </div>
                ))}
              </CommandGroup>
            ))
          : null}

        {variant === "collapsibleGroups"
          ? Object.entries(DEFAULT_DEPARTMENT_GROUPS).map(([category, items]) => {
              const isCollapsed = collapsed[category];
              return (
                <CommandGroup
                  heading={
                    <button
                      className="flex w-full items-center gap-1"
                      onClick={() =>
                        setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))
                      }
                      type="button"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="size-3" />
                      ) : (
                        <ChevronDownIcon className="size-3" />
                      )}
                      {category}
                    </button>
                  }
                  key={category}
                >
                  {!isCollapsed
                    ? items.map((item) => (
                        <ComboboxCheckItem
                          key={item.value}
                          onSelect={handleSelect}
                          option={item}
                          selected={value === item.value}
                        />
                      ))
                    : null}
                </CommandGroup>
              );
            })
          : null}

        {variant === "recentVsAllItems" ? (
          <>
            <CommandGroup heading={recentGroupLabel}>
              {DEFAULT_RECENT_OPTIONS.map((item) => (
                <ComboboxCheckItem
                  key={item}
                  onSelect={handleSelect}
                  option={item}
                  selected={value === item}
                />
              ))}
            </CommandGroup>
            <ComboboxGroupSections
              groups={[{ label: allGroupLabel, options: flatOptions }]}
              onSelect={handleSelect}
              selectedValue={value}
            />
          </>
        ) : null}

        {variant === "favoritesPlusAllItems" ? (
          <>
            <CommandGroup heading={favoritesGroupLabel}>
              {DEFAULT_FAVORITE_OPTIONS.filter((option) => option.favorite).map((option) => (
                <ComboboxCheckItem
                  key={option.value}
                  onSelect={handleSelect}
                  option={option}
                  selected={value === option.value}
                />
              ))}
            </CommandGroup>
            <ComboboxGroupSections
              groups={[{ label: allGroupLabel, options: DEFAULT_FAVORITE_OPTIONS }]}
              onSelect={handleSelect}
              selectedValue={value}
            />
          </>
        ) : null}

        {variant === "multipleGroupsWithLabels" ||
        variant === "categoriesWithSeparators" ||
        variant === "groupsWithItemCounts" ? (
          <ComboboxGroupSections
            groups={resolvedGroups}
            onSelect={handleSelect}
            selectedValue={value}
            showCount={showCounts ?? variant === "groupsWithItemCounts"}
            withSeparators={variant === "categoriesWithSeparators"}
          />
        ) : null}
      </ComboboxCommandList>
    </ComboboxPopoverShell>
  );
}
