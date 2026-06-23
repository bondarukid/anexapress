"use client";

import {
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { TextInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupCharacterCount,
  InputGroupInlineEndAddon,
  InputGroupInlineStartAddon,
  InputGroupShell,
  formatInputGroupCount,
} from "@/components/inputs/input-groups/utils/input-group-layout";

/**
 * Configurable text input group covering Kibo UI input-group-text-1…4.
 * https://www.kibo-ui.com/patterns/input-group/text
 */
export function TextInputGroup({
  variant = "currency",
  placeholder,
  className,
  containerClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  prefix,
  suffix,
  currencySymbol = "$",
  domainSuffix = "@vercel.com",
  currentCount = 0,
  maxCount = 280,
  countLabel,
  ...controlProps
}: TextInputGroupProps) {
  const inputProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    disabled,
    id,
  };

  const countText = formatInputGroupCount(countLabel, currentCount, maxCount);

  if (variant === "urlBuilder") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInlineStartAddon>
          <InputGroupText>{prefix ?? "https://"}</InputGroupText>
        </InputGroupInlineStartAddon>
        <InputGroupInput {...inputProps} placeholder={placeholder ?? "example"} />
        <InputGroupInlineEndAddon>
          <InputGroupText>{suffix ?? ".com"}</InputGroupText>
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "emailDomain") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput {...inputProps} placeholder={placeholder ?? "username"} />
        <InputGroupInlineEndAddon>
          <InputGroupText>{domainSuffix}</InputGroupText>
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "characterCounter") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          {...inputProps}
          maxLength={maxCount}
          placeholder={placeholder ?? "Enter tweet..."}
        />
        <InputGroupInlineEndAddon>
          {countText ? <InputGroupCharacterCount label={countText} /> : null}
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupInlineStartAddon>
        <InputGroupText>{currencySymbol}</InputGroupText>
      </InputGroupInlineStartAddon>
      <InputGroupInput {...inputProps} placeholder={placeholder ?? "0.00"} />
      <InputGroupInlineEndAddon>
        <InputGroupText>{suffix ?? "USD"}</InputGroupText>
      </InputGroupInlineEndAddon>
    </InputGroupShell>
  );
}
