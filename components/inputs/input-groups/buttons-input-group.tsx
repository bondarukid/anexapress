"use client";

import { InfoIcon, SearchIcon } from "lucide-react";

import {
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { ButtonsInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupCopyButton,
  InputGroupFavoriteButton,
  InputGroupPasswordActions,
} from "@/components/inputs/input-groups/utils/input-group-actions";
import {
  InputGroupInlineEndAddon,
  InputGroupShell,
} from "@/components/inputs/input-groups/utils/input-group-layout";

/**
 * Configurable buttons input group covering Kibo UI input-group-buttons-1…4.
 * https://www.kibo-ui.com/patterns/input-group/buttons
 */
export function ButtonsInputGroup({
  variant = "copy",
  placeholder,
  className,
  containerClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  value,
  defaultValue,
  readOnly,
  copied,
  onCopiedChange,
  onCopy,
  favorited,
  onFavoritedChange,
  visible,
  onVisibleChange,
  onRegenerate,
  onSearch,
  copyAriaLabel = "Copy",
  searchAriaLabel = "Search",
  ...controlProps
}: ButtonsInputGroupProps) {
  const inputProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    defaultValue,
    disabled,
    id,
    readOnly,
    value,
  };

  if (variant === "multipleActions") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "https://github.com/shadcn"}
          readOnly={readOnly ?? true}
        />
        <InputGroupInlineEndAddon>
          <InputGroupButton aria-label="Info" size="icon-xs" type="button" variant="ghost">
            <InfoIcon />
          </InputGroupButton>
        </InputGroupInlineEndAddon>
        <InputGroupInlineEndAddon>
          <InputGroupFavoriteButton
            favorited={favorited}
            onFavoritedChange={onFavoritedChange}
          />
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "search") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput {...inputProps} placeholder={placeholder ?? "Search..."} />
        <InputGroupInlineEndAddon className="pr-2">
          <InputGroupButton
            aria-label={searchAriaLabel}
            onClick={onSearch}
            size="sm"
            type="button"
            variant="secondary"
          >
            Search
            <SearchIcon />
          </InputGroupButton>
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "passwordActions") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          {...inputProps}
          placeholder={placeholder ?? "Enter password"}
          type={visible ? "text" : "password"}
        />
        <InputGroupInlineEndAddon>
          <InputGroupPasswordActions
            onRegenerate={onRegenerate ?? (() => undefined)}
            onVisibleChange={onVisibleChange}
            visible={visible}
          />
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupInput
        {...inputProps}
        placeholder={placeholder ?? "https://x.com/shadcn"}
        readOnly={readOnly ?? true}
      />
      <InputGroupInlineEndAddon>
        <InputGroupCopyButton
          ariaLabel={copyAriaLabel}
          copied={copied}
          onCopiedChange={onCopiedChange}
          onCopy={onCopy}
        />
      </InputGroupInlineEndAddon>
    </InputGroupShell>
  );
}
