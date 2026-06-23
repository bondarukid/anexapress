"use client";

import {
  ArrowUpIcon,
  FileIcon,
  ImageIcon,
  MicIcon,
  PaperclipIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react";

import {
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type { AiInputGroupProps } from "@/components/inputs/input-groups/types";
import { InputGroupSendButton } from "@/components/inputs/input-groups/utils/input-group-actions";
import {
  InputGroupBlockEndAddon,
  InputGroupCharacterCount,
  InputGroupVerticalSeparator,
  InputGroupWideShell,
  formatInputGroupCount,
} from "@/components/inputs/input-groups/utils/input-group-layout";
import {
  InputGroupDropdownMenu,
  InputGroupGhostMenuButton,
} from "@/components/inputs/input-groups/utils/input-group-menu";

const DEFAULT_MODE_OPTIONS = [
  { label: "Auto" },
  { label: "Agent" },
  { label: "Manual" },
];

const DEFAULT_ATTACHMENT_OPTIONS = [
  { label: "Attach File", icon: <FileIcon className="mr-2" /> },
  { label: "Attach Image", icon: <ImageIcon className="mr-2" /> },
];

const DEFAULT_VOICE_MODEL_OPTIONS = [
  { label: "Claude 3.5 Sonnet" },
  { label: "Claude 3 Opus" },
  { label: "Claude 3 Haiku" },
];

/**
 * Configurable AI input group covering Kibo UI input-group-ai-1…4.
 * https://www.kibo-ui.com/patterns/input-group/ai
 */
export function AiInputGroup({
  variant = "promptInput",
  placeholder,
  className,
  containerClassName,
  textareaClassName,
  disabled,
  "aria-invalid": ariaInvalid,
  id,
  modeLabel = "Auto",
  modeOptions = DEFAULT_MODE_OPTIONS,
  usageText = "52% used",
  modelLabel = "GPT-4",
  currentCount = 0,
  maxCount = 4000,
  countLabel,
  onSend,
  sendDisabled,
  ...controlProps
}: AiInputGroupProps) {
  const countText = formatInputGroupCount(countLabel, currentCount, maxCount);

  const textareaProps = {
    ...controlProps,
    "aria-invalid": ariaInvalid,
    className: textareaClassName,
    disabled,
    id,
  };

  if (variant === "simplePrompt") {
    return (
      <InputGroupWideShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          placeholder={placeholder ?? "Ask me anything..."}
        />
        <InputGroupBlockEndAddon>
          <InputGroupButton size="icon-xs" type="button" variant="ghost">
            <SparklesIcon />
          </InputGroupButton>
          {countText ? (
            <InputGroupCharacterCount className="ml-auto" label={countText} />
          ) : null}
          <InputGroupVerticalSeparator />
          <InputGroupSendButton disabled={sendDisabled ?? disabled} onClick={onSend} />
        </InputGroupBlockEndAddon>
      </InputGroupWideShell>
    );
  }

  if (variant === "withAttachments") {
    return (
      <InputGroupWideShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          placeholder={placeholder ?? "Describe your task..."}
        />
        <InputGroupBlockEndAddon>
          <InputGroupDropdownMenu
            items={DEFAULT_ATTACHMENT_OPTIONS}
            side="top"
          >
            <InputGroupButton size="icon-xs" type="button" variant="ghost">
              <FileIcon />
            </InputGroupButton>
          </InputGroupDropdownMenu>
          <InputGroupText className="ml-auto">{modelLabel}</InputGroupText>
          <InputGroupSendButton disabled={sendDisabled ?? disabled} onClick={onSend} />
        </InputGroupBlockEndAddon>
      </InputGroupWideShell>
    );
  }

  if (variant === "withVoice") {
    return (
      <InputGroupWideShell className={className} containerClassName={containerClassName}>
        <InputGroupTextarea
          {...textareaProps}
          placeholder={placeholder ?? "Type or speak your message..."}
        />
        <InputGroupBlockEndAddon>
          <InputGroupButton size="icon-xs" type="button" variant="ghost">
            <PaperclipIcon />
          </InputGroupButton>
          <InputGroupButton size="icon-xs" type="button" variant="ghost">
            <MicIcon />
          </InputGroupButton>
          <InputGroupDropdownMenu
            align="end"
            items={DEFAULT_VOICE_MODEL_OPTIONS}
            side="top"
          >
            <InputGroupGhostMenuButton
              className="ml-auto"
              label={modelLabel}
              textClassName="ml-auto text-xs"
            />
          </InputGroupDropdownMenu>
          <InputGroupVerticalSeparator />
          <InputGroupSendButton disabled={sendDisabled ?? disabled} onClick={onSend} />
        </InputGroupBlockEndAddon>
      </InputGroupWideShell>
    );
  }

  return (
    <InputGroupWideShell className={className} containerClassName={containerClassName}>
      <InputGroupTextarea
        {...textareaProps}
        placeholder={placeholder ?? "Ask, Search or Chat..."}
      />
      <InputGroupBlockEndAddon>
        <InputGroupButton
          className="rounded-full"
          size="icon-xs"
          type="button"
          variant="outline"
        >
          <PlusIcon />
        </InputGroupButton>
        <InputGroupDropdownMenu
          className="[--radius:0.95rem]"
          items={modeOptions}
          side="top"
        >
          <InputGroupButton type="button" variant="ghost">
            {modeLabel}
          </InputGroupButton>
        </InputGroupDropdownMenu>
        <InputGroupText className="ml-auto">{usageText}</InputGroupText>
        <InputGroupVerticalSeparator />
        <InputGroupButton
          className="rounded-full"
          disabled={sendDisabled ?? disabled}
          onClick={onSend}
          size="icon-xs"
          type="button"
          variant="default"
        >
          <ArrowUpIcon />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupBlockEndAddon>
    </InputGroupWideShell>
  );
}
