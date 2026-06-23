"use client";

import { InfoIcon } from "lucide-react";

import {
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LabelInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  toInputGroupInputControlProps,
  toInputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/utils/input-group-props";
import {
  InputGroupBlockStartAddon,
  InputGroupCharacterCount,
  InputGroupInlineStartAddon,
  InputGroupShell,
  formatInputGroupCount,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

/**
 * Configurable label input group covering Kibo UI input-group-label-1…4.
 * https://www.kibo-ui.com/patterns/input-group/label
 */
export function LabelInputGroup({
  variant = "inlineLabels",
  placeholder,
  className,
  containerClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id = "email",
  label = "Email",
  tooltip = "We'll use this to send you notifications",
  description,
  currentCount = 0,
  maxCount = 60,
  countLabel,
  tooltipAriaLabel = "Help",
  ...controlProps
}: LabelInputGroupProps) {
  const inputProps = {
    ...toInputGroupInputControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled,
  };

  const textareaProps = {
    ...toInputGroupTextareaControlProps(controlProps),
    "aria-invalid": ariaInvalid,
    disabled,
  };

  const countText = formatInputGroupCount(countLabel, currentCount, maxCount);

  if (variant === "labelTooltip") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          {...inputProps}
          id={id}
          placeholder={placeholder ?? "shadcn@vercel.com"}
        />
        <InputGroupBlockStartAddon>
          <Label className="text-foreground" htmlFor={id}>
            {label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                aria-label={tooltipAriaLabel}
                className="ml-auto rounded-full"
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <InfoIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupBlockStartAddon>
      </InputGroupShell>
    );
  }

  if (variant === "blockLabels") {
    return (
      <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupInput
            {...inputProps}
            id={id ?? "name"}
            placeholder={placeholder ?? "Enter your name"}
          />
          <InputGroupBlockStartAddon>
            <Label className="text-foreground" htmlFor={id ?? "name"}>
              {label ?? "Full Name"}
            </Label>
          </InputGroupBlockStartAddon>
        </InputGroupShell>
        <InputGroupShell className={className} maxWidthClassName="max-w-none">
          <InputGroupTextarea
            {...textareaProps}
            className="min-h-[100px]"
            id="bio"
            placeholder={description ?? "Tell us about yourself"}
          />
          <InputGroupBlockStartAddon className="border-b">
            <Label className="text-foreground" htmlFor="bio">
              Bio
            </Label>
          </InputGroupBlockStartAddon>
        </InputGroupShell>
      </div>
    );
  }

  if (variant === "labelCounter") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupInput
          {...inputProps}
          id={id ?? "title"}
          maxLength={maxCount}
          placeholder={placeholder ?? "Enter title"}
        />
        <InputGroupBlockStartAddon>
          <Label className="text-foreground" htmlFor={id ?? "title"}>
            {label ?? "Title"}
          </Label>
          {countText ? (
            <InputGroupCharacterCount className="ml-auto" label={countText} />
          ) : null}
        </InputGroupBlockStartAddon>
      </InputGroupShell>
    );
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4", containerClassName)}>
      <InputGroupShell className={className} maxWidthClassName="max-w-none">
        <InputGroupInput
          {...inputProps}
          id={id}
          placeholder={placeholder ?? "shadcn"}
        />
        <InputGroupInlineStartAddon>
          <Label htmlFor={id}>@</Label>
        </InputGroupInlineStartAddon>
      </InputGroupShell>
      <InputGroupShell className={className} maxWidthClassName="max-w-none">
        <InputGroupInlineStartAddon>
          <Label htmlFor="price">$</Label>
        </InputGroupInlineStartAddon>
        <InputGroupInput {...inputProps} id="price" placeholder={placeholder ?? "0.00"} />
      </InputGroupShell>
    </div>
  );
}
