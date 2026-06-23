"use client";

import { BoldIcon, ItalicIcon, SendIcon, UnderlineIcon } from "lucide-react";

import {
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { CustomInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupBlockEndAddon,
  InputGroupBlockStartAddon,
  InputGroupCharacterCount,
  InputGroupShell,
  formatInputGroupCount,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

/**
 * Configurable custom input group covering Kibo UI input-group-custom-1…4.
 * https://www.kibo-ui.com/patterns/input-group/custom
 */
export function CustomInputGroup({
  variant = "textareaActions",
  placeholder,
  className,
  containerClassName,
  textareaClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  label = "Comment",
  onSubmit,
  submitLabel,
  currentCount = 0,
  maxCount = 500,
  countLabel,
  rows,
  ...controlProps
}: CustomInputGroupProps) {
  const textareaProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    disabled,
    rows,
  };

  const countText = formatInputGroupCount(countLabel, currentCount, maxCount);

  if (variant === "textareaCounter") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[100px]", textareaClassName)}
          maxLength={maxCount}
          placeholder={placeholder ?? "Write your message..."}
        />
        <InputGroupBlockEndAddon>
          {countText ? <InputGroupCharacterCount label={countText} /> : null}
          <InputGroupButton
            className="ml-auto"
            onClick={onSubmit}
            size="sm"
            type="button"
            variant="default"
          >
            {submitLabel ?? "Post"}
            <SendIcon />
          </InputGroupButton>
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "textareaToolbar") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[100px]", textareaClassName)}
          placeholder={placeholder ?? "Write your content..."}
        />
        <InputGroupBlockStartAddon className="border-b">
          <InputGroupButton aria-label="Bold" size="icon-xs" type="button" variant="ghost">
            <BoldIcon />
          </InputGroupButton>
          <InputGroupButton aria-label="Italic" size="icon-xs" type="button" variant="ghost">
            <ItalicIcon />
          </InputGroupButton>
          <InputGroupButton aria-label="Underline" size="icon-xs" type="button" variant="ghost">
            <UnderlineIcon />
          </InputGroupButton>
        </InputGroupBlockStartAddon>
        <InputGroupBlockEndAddon>
          <InputGroupButton
            className="ml-auto"
            onClick={onSubmit}
            size="sm"
            type="button"
            variant="default"
          >
            {submitLabel ?? "Submit"}
          </InputGroupButton>
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "textareaLabel") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[100px]", textareaClassName)}
          id={id ?? "comment"}
          placeholder={placeholder ?? "Share your thoughts..."}
        />
        <InputGroupBlockStartAddon className="border-b">
          <Label className="text-foreground" htmlFor={id ?? "comment"}>
            {label}
          </Label>
        </InputGroupBlockStartAddon>
        <InputGroupBlockEndAddon>
          <InputGroupButton
            className="ml-auto"
            onClick={onSubmit}
            size="sm"
            type="button"
            variant="default"
          >
            {submitLabel ?? "Post Comment"}
          </InputGroupButton>
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupTextarea
        {...textareaProps}
        className={cn("min-h-[100px]", textareaClassName)}
        id={id}
        placeholder={placeholder ?? "Type your message..."}
      />
      <InputGroupBlockEndAddon>
        <InputGroupButton
          className="ml-auto"
          onClick={onSubmit}
          size="sm"
          type="button"
          variant="default"
        >
          {submitLabel ?? "Submit"}
        </InputGroupButton>
      </InputGroupBlockEndAddon>
    </InputGroupShell>
  );
}
