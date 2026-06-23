"use client";

import {
  BoldIcon,
  CornerDownLeftIcon,
  FileCodeIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  RefreshCwIcon,
  SendIcon,
  SmileIcon,
  UnderlineIcon,
} from "lucide-react";

import {
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type { TextareaInputGroupProps } from "@/components/inputs/input-groups/types";
import {
  InputGroupBlockEndAddon,
  InputGroupBlockStartAddon,
  InputGroupCharacterCount,
  InputGroupShell,
  formatInputGroupCount,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import { cn } from "@/lib/utils";

/**
 * Configurable textarea input group covering Kibo UI input-group-textarea-1…4.
 * https://www.kibo-ui.com/patterns/input-group/textarea
 */
export function TextareaInputGroup({
  variant = "codeEditor",
  placeholder,
  className,
  containerClassName,
  textareaClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  languageLabel = "script.js",
  currentCount = 0,
  maxCount = 500,
  countLabel,
  onSend,
  rows,
  ...controlProps
}: TextareaInputGroupProps) {
  const textareaProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    disabled,
    rows,
  };

  const countText = formatInputGroupCount(countLabel, currentCount, maxCount);

  if (variant === "characterCounter") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[120px]", textareaClassName)}
          id={id}
          maxLength={maxCount}
          placeholder={placeholder ?? "Enter your message..."}
        />
        <InputGroupBlockEndAddon className="border-t">
          {countText ? (
            <InputGroupCharacterCount className="ml-auto" label={countText} />
          ) : null}
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  if (variant === "richTextToolbar") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[150px]", textareaClassName)}
          id={id}
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
          <InputGroupButton aria-label="Link" size="icon-xs" type="button" variant="ghost">
            <LinkIcon />
          </InputGroupButton>
          <InputGroupButton aria-label="List" size="icon-xs" type="button" variant="ghost">
            <ListIcon />
          </InputGroupButton>
        </InputGroupBlockStartAddon>
      </InputGroupShell>
    );
  }

  if (variant === "chatInput") {
    return (
      <InputGroupShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          className={cn("min-h-[80px]", textareaClassName)}
          id={id}
          placeholder={placeholder ?? "Type a message..."}
        />
        <InputGroupBlockEndAddon className="border-t">
          <InputGroupButton aria-label="Emoji" size="icon-xs" type="button" variant="ghost">
            <SmileIcon />
          </InputGroupButton>
          {countText ? (
            <InputGroupCharacterCount className="ml-auto" label={countText ?? `0/2000`} />
          ) : (
            <InputGroupText className="ml-auto">0/2000</InputGroupText>
          )}
          <InputGroupButton
            className="ml-2"
            onClick={onSend}
            size="sm"
            type="button"
            variant="default"
          >
            Send
            <SendIcon />
          </InputGroupButton>
        </InputGroupBlockEndAddon>
      </InputGroupShell>
    );
  }

  return (
    <InputGroupShell className={className} containerClassName={containerClassName}>
      <InputGroupTextarea
        {...textareaProps}
        className={cn("min-h-[200px]", textareaClassName)}
        id={id}
        placeholder={placeholder ?? "console.log('Hello, world!');"}
      />
      <InputGroupBlockEndAddon className="border-t">
        <InputGroupText>Line 1, Column 1</InputGroupText>
        <InputGroupButton className="ml-auto" size="sm" type="button" variant="default">
          Run
          <CornerDownLeftIcon />
        </InputGroupButton>
      </InputGroupBlockEndAddon>
      <InputGroupBlockStartAddon className="border-b">
        <InputGroupText className="font-medium font-mono">
          <FileCodeIcon />
          {languageLabel}
        </InputGroupText>
        <InputGroupButton className="ml-auto" size="icon-xs" type="button">
          <RefreshCwIcon />
        </InputGroupButton>
      </InputGroupBlockStartAddon>
    </InputGroupShell>
  );
}
