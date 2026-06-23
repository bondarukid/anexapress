"use client";

import type { RichContentComboboxProps } from "@/components/comboboxes/types";
import {
  DEFAULT_FRUIT_OPTIONS,
  DEFAULT_PRODUCT_OPTIONS,
  DEFAULT_USER_OPTIONS,
  findComboboxOption,
  findComboboxLabel,
} from "@/components/comboboxes/utils/combobox-data";
import { ComboboxCheckItem } from "@/components/comboboxes/utils/combobox-items";
import {
  ComboboxCommandList,
  ComboboxPopoverShell,
  ComboboxTriggerButton,
} from "@/components/comboboxes/utils/combobox-layout";
import {
  ComboboxActionItemContent,
  ComboboxAvatarItemContent,
  ComboboxAvatarTriggerContent,
  ComboboxColorItemContent,
  ComboboxDescriptionItemContent,
  ComboboxIconDescriptionItemContent,
  ComboboxMetadataItemContent,
  ComboboxStatusItemContent,
} from "@/components/comboboxes/utils/combobox-rich-items";
import {
  useComboboxOpenState,
  useComboboxSingleValue,
} from "@/components/comboboxes/utils/combobox-selection";

/**
 * Configurable rich-content combobox covering Kibo UI combobox-rich-content-1…7.
 * https://www.kibo-ui.com/patterns/combobox/rich-content
 */
export function RichContentCombobox({
  variant = "itemsWithAvatars",
  placeholder,
  searchPlaceholder,
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
  renderItem,
  onItemAction,
  itemActionLabel = "Open",
  statusLabels,
}: RichContentComboboxProps) {
  const resolvedOptions = (() => {
    if (options) {
      return options;
    }
    if (variant === "itemsWithAvatars") {
      return DEFAULT_USER_OPTIONS;
    }
    if (variant === "colorCodedItems") {
      return DEFAULT_FRUIT_OPTIONS;
    }
    if (
      variant === "itemsWithDescriptions" ||
      variant === "itemsWithMetadata" ||
      variant === "itemsWithIconsAndDescriptions" ||
      variant === "itemsWithStatusIndicators" ||
      variant === "itemsWithActionButtons"
    ) {
      return DEFAULT_PRODUCT_OPTIONS;
    }
    return DEFAULT_USER_OPTIONS;
  })();

  const resolvedPlaceholder =
    placeholder ??
    (variant === "itemsWithAvatars"
      ? "Select user..."
      : variant === "colorCodedItems"
        ? "Select fruit..."
        : "Select product...");

  const { open, setOpen } = useComboboxOpenState(controlledOpen, onOpenChange);
  const { value, setValue } = useComboboxSingleValue(controlledValue, onValueChange, defaultValue ?? "");

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  const selectedOption = findComboboxOption(resolvedOptions, value);

  const renderRichItem = (option: (typeof resolvedOptions)[number]) => {
    if (renderItem) {
      return renderItem({
        option,
        selected: value === option.value,
        onSelect: handleSelect,
      });
    }

    switch (variant) {
      case "itemsWithAvatars":
        return <ComboboxAvatarItemContent option={option} />;
      case "itemsWithDescriptions":
        return <ComboboxDescriptionItemContent option={option} />;
      case "itemsWithStatusIndicators":
        return <ComboboxStatusItemContent option={option} statusLabels={statusLabels} />;
      case "itemsWithMetadata":
        return <ComboboxMetadataItemContent option={option} />;
      case "itemsWithIconsAndDescriptions":
        return <ComboboxIconDescriptionItemContent option={option} />;
      case "colorCodedItems":
        return <ComboboxColorItemContent option={option} />;
      case "itemsWithActionButtons":
        return (
          <ComboboxActionItemContent
            actionLabel={itemActionLabel}
            onAction={onItemAction}
            option={option}
          />
        );
      default:
        return option.label;
    }
  };

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
          {selectedOption ? (
            variant === "itemsWithAvatars" ? (
              <ComboboxAvatarTriggerContent option={selectedOption} />
            ) : (
              findComboboxLabel(resolvedOptions, value)
            )
          ) : (
            resolvedPlaceholder
          )}
        </ComboboxTriggerButton>
      }
    >
      <ComboboxCommandList
        emptyMessage={emptyMessage}
        searchPlaceholder={searchPlaceholder ?? "Search..."}
      >
        {renderItem ? (
          <div className="p-1">
            {resolvedOptions.map((option) => (
              <div key={option.value}>{renderRichItem(option)}</div>
            ))}
          </div>
        ) : (
          <div className="p-1">
            {resolvedOptions.map((option) => (
              <ComboboxCheckItem
                key={option.value}
                onSelect={handleSelect}
                option={option}
                selected={value === option.value}
              >
                {renderRichItem(option)}
              </ComboboxCheckItem>
            ))}
          </div>
        )}
      </ComboboxCommandList>
    </ComboboxPopoverShell>
  );
}
