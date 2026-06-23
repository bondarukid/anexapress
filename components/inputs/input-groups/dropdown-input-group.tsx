"use client";

import { ChevronDownIcon, MoreHorizontalIcon } from "lucide-react";

import {
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type { DropdownInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  toInputGroupInputControlProps,
  toInputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/utils/input-group-props";
import {
  InputGroupBlockEndAddon,
  InputGroupInlineEndAddon,
  InputGroupInlineStartAddon,
  InputGroupShell,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import {
  InputGroupDropdownMenu,
} from "@/components/inputs/input-groups/utils/input-group-menu";
import { cn } from "@/lib/utils";

const DEFAULT_ACTION_ITEMS = [
  { label: "Settings" },
  { label: "Copy path" },
  { label: "Open location" },
];

const DEFAULT_FILTER_ITEMS = [
  { label: "All Products" },
  { label: "Electronics" },
  { label: "Clothing" },
];

const DEFAULT_PREFIX_ITEMS = [{ label: "https://" }, { label: "http://" }];
const DEFAULT_SUFFIX_ITEMS = [
  { label: ".com" },
  { label: ".net" },
  { label: ".org" },
  { label: ".io" },
];

const DEFAULT_FORMAT_ITEMS = [
  { label: "Plain Text" },
  { label: "Markdown" },
  { label: "HTML" },
];

/**
 * Configurable dropdown input group covering Kibo UI input-group-dropdown-1…4.
 * https://www.kibo-ui.com/patterns/input-group/dropdown
 */
export function DropdownInputGroup({
  variant = "dropdownActions",
  placeholder,
  className,
  containerClassName,
  textareaClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  menuItems = DEFAULT_ACTION_ITEMS,
  filterOptions = DEFAULT_FILTER_ITEMS,
  prefixText = "https://",
  dropdownLabel = "Category",
  ...controlProps
}: DropdownInputGroupProps) {
  const inputProps = {
    ...toInputGroupInputControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled,
    id,
  };

  const textareaProps = {
    ...toInputGroupTextareaControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled,
    id,
  };

  if (variant === "searchFilters") {
    return (
      <InputGroupShell
        className={cn("bg-background [--radius:1rem]", className)}
        containerClassName={containerClassName}
      >
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "Search products"}
        />
        <InputGroupInlineEndAddon>
          <InputGroupDropdownMenu align="end" items={filterOptions}>
            <InputGroupButton className="!pr-1.5 text-xs" type="button" variant="ghost">
              {dropdownLabel} <ChevronDownIcon className="size-3" />
            </InputGroupButton>
          </InputGroupDropdownMenu>
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "urlBuilderDropdown") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInlineStartAddon>
            <InputGroupDropdownMenu items={DEFAULT_PREFIX_ITEMS}>
              <InputGroupButton className="text-xs" type="button" variant="ghost">
                {prefixText} <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </InputGroupDropdownMenu>
          </InputGroupInlineStartAddon>
          <InputGroupInput {...inputProps} placeholder={placeholder ?? "example.com"} />
        </InputGroupShell>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInput {...inputProps} placeholder={placeholder ?? "subdomain"} />
          <InputGroupInlineEndAddon>
            <InputGroupDropdownMenu align="end" items={DEFAULT_SUFFIX_ITEMS}>
              <InputGroupButton className="text-xs" type="button" variant="ghost">
                .com <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </InputGroupDropdownMenu>
          </InputGroupInlineEndAddon>
        </InputGroupShell>
      </div>
    );
  }

  if (variant === "textareaDropdown") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[100px]", textareaClassName)}
          placeholder={placeholder ?? "Write your message..."}
        />
        <InputGroupBlockEndAddon className="border-t">
          <InputGroupDropdownMenu items={menuItems.length ? menuItems : DEFAULT_FORMAT_ITEMS}>
            <InputGroupButton size="sm" type="button" variant="ghost">
              Format <ChevronDownIcon className="size-3" />
            </InputGroupButton>
          </InputGroupDropdownMenu>
          <InputGroupButton className="ml-auto" size="sm" type="button" variant="default">
            Send
          </InputGroupButton>
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupInput
        {...inputProps}
        placeholder={placeholder ?? "Enter file name"}
      />
      <InputGroupInlineEndAddon>
        <InputGroupDropdownMenu align="end" items={menuItems}>
          <InputGroupButton aria-label="More" size="icon-xs" type="button" variant="ghost">
            <MoreHorizontalIcon />
          </InputGroupButton>
        </InputGroupDropdownMenu>
      </InputGroupInlineEndAddon>
    </InputGroupShell>
  );
}
