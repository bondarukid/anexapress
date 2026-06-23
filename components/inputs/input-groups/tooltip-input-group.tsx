"use client";

import { InfoIcon } from "lucide-react";

import {
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TooltipInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupInlineEndAddon,
  InputGroupShell,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

const DEFAULT_PASSWORD_TOOLTIPS = [
  "Password must be at least 8 characters",
  "Enter the same password as above",
];

/**
 * Configurable tooltip input group covering Kibo UI input-group-tooltip-1…3.
 * https://www.kibo-ui.com/patterns/input-group/tooltip
 */
export function TooltipInputGroup({
  variant = "passwordRequirements",
  placeholder,
  className,
  containerClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  tooltipContent,
  requirements = DEFAULT_PASSWORD_TOOLTIPS,
  tooltipAriaLabel = "Help",
  ...controlProps
}: TooltipInputGroupProps) {
  const renderTooltipButton = (content: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <InputGroupButton aria-label={tooltipAriaLabel} size="icon-xs" type="button" variant="ghost">
          <InfoIcon />
        </InputGroupButton>
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  if (variant === "helpTooltips") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          aria-invalid={ariaInvalid}
          disabled={disabled}
          id={id}
          placeholder={placeholder ?? "Email address"}
          type="email"
          {...controlProps}
        />
        <InputGroupInlineEndAddon>
          {renderTooltipButton(
            typeof tooltipContent === "string"
              ? tooltipContent
              : "We'll never share your email",
          )}
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "apiKeyInfo") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          aria-invalid={ariaInvalid}
          disabled={disabled}
          id={id}
          placeholder={placeholder ?? "API key"}
          type="password"
          {...controlProps}
        />
        <InputGroupInlineEndAddon>
          {renderTooltipButton(
            typeof tooltipContent === "string"
              ? tooltipContent
              : "Found in your account settings",
          )}
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
      <InputGroupShell className={className} maxWidthClassName="max-w-none">
        <InputGroupInput
          aria-invalid={ariaInvalid}
          disabled={disabled}
          id={id ?? "password"}
          placeholder={placeholder ?? "Enter password"}
          type="password"
          {...controlProps}
        />
        <InputGroupInlineEndAddon>
          {renderTooltipButton(requirements[0] ?? "Password must be at least 8 characters")}
        </InputGroupInlineEndAddon>
      </InputGroupShell>
      <InputGroupShell className={className} maxWidthClassName="max-w-none">
        <InputGroupInput
          disabled={disabled}
          placeholder="Confirm password"
          type="password"
          {...controlProps}
        />
        <InputGroupInlineEndAddon>
          {renderTooltipButton(requirements[1] ?? "Enter the same password as above")}
        </InputGroupInlineEndAddon>
      </InputGroupShell>
    </div>
  );
}
