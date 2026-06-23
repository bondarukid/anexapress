"use client";

import {
  CreditCardIcon,
  EyeIcon,
  HelpCircleIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";

import { InputGroupInput } from "@/components/ui/input-group";
import type { IconsInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupInlineEndAddon,
  InputGroupInlineStartAddon,
  InputGroupShell,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

const DEFAULT_CONTACT_FIELDS = [
  {
    id: "email",
    placeholder: "Email address",
    leadingIcon: MailIcon,
    type: "email" as const,
  },
  {
    id: "phone",
    placeholder: "Phone number",
    leadingIcon: PhoneIcon,
    type: "tel" as const,
  },
];

/**
 * Configurable icons input group covering Kibo UI input-group-icons-1…4.
 * https://www.kibo-ui.com/patterns/input-group/icons
 */
export function IconsInputGroup({
  variant = "searchIcon",
  placeholder,
  className,
  containerClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  fields = DEFAULT_CONTACT_FIELDS,
  onTrailingClick,
  trailingAriaLabel,
  ...controlProps
}: IconsInputGroupProps) {
  const inputProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    disabled,
  };

  if (variant === "contactFields") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        {fields.map((field) => {
          const FieldIcon = field.leadingIcon ?? MailIcon;
          const Trailing = field.trailingIcon;

          return (
            <InputGroupShell key={field.id} className={className} maxWidthClassName="max-w-none">
              <InputGroupInput
                {...inputProps}
                id={field.id}
                placeholder={field.placeholder}
                type={field.type}
              />
              <InputGroupInlineStartAddon>
                <FieldIcon />
              </InputGroupInlineStartAddon>
              {Trailing ? (
                <InputGroupInlineEndAddon>
                  <Trailing />
                </InputGroupInlineEndAddon>
              ) : null}
            </InputGroupShell>
          );
        })}
      </div>
    );
  }

  if (variant === "dualIcons") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInlineStartAddon>
            <CreditCardIcon />
          </InputGroupInlineStartAddon>
          <InputGroupInput {...inputProps} placeholder={placeholder ?? "Card number"} />
          <InputGroupInlineEndAddon>
            <LockIcon />
          </InputGroupInlineEndAddon>
        </InputGroupShell>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInlineStartAddon>
            <LockIcon />
          </InputGroupInlineStartAddon>
          <InputGroupInput
            {...inputProps}
            placeholder={placeholder ?? "Password"}
            type="password"
          />
          <InputGroupInlineEndAddon>
            <HelpCircleIcon />
          </InputGroupInlineEndAddon>
        </InputGroupShell>
      </div>
    );
  }

  if (variant === "multipleIcons") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInput
            {...inputProps}
            placeholder={placeholder ?? "Enter password"}
            type="password"
          />
          <InputGroupInlineEndAddon>
            <EyeIcon />
          </InputGroupInlineEndAddon>
          <InputGroupInlineEndAddon>
            <RefreshCwIcon />
          </InputGroupInlineEndAddon>
        </InputGroupShell>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInlineStartAddon>
            <LockIcon />
          </InputGroupInlineStartAddon>
          <InputGroupInput {...inputProps} placeholder="API key" type="password" />
          <InputGroupInlineEndAddon>
            <RefreshCwIcon />
          </InputGroupInlineEndAddon>
        </InputGroupShell>
      </div>
    );
  }

  const StartIcon = LeadingIcon ?? SearchIcon;
  const EndIcon = TrailingIcon;

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupInput {...inputProps} id={id} placeholder={placeholder ?? "Search..."} />
      <InputGroupInlineStartAddon>
        <StartIcon />
      </InputGroupInlineStartAddon>
      {EndIcon ? (
        <InputGroupInlineEndAddon>
          <button
            aria-label={trailingAriaLabel}
            className="inline-flex"
            onClick={onTrailingClick}
            type="button"
          >
            <EndIcon />
          </button>
        </InputGroupInlineEndAddon>
      ) : null}
    </InputGroupShell>
  );
}
