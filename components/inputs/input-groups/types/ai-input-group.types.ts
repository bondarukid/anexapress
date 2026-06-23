import type {
  BaseInputGroupProps,
  InputGroupCountProps,
  InputGroupMenuItem,
  InputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type AiInputGroupVariant =
  | "promptInput"
  | "simplePrompt"
  | "withAttachments"
  | "withVoice";

export type AiInputGroupProps = BaseInputGroupProps &
  InputGroupTextareaControlProps &
  InputGroupCountProps & {
    variant?: AiInputGroupVariant;
    modeLabel?: string;
    modeOptions?: InputGroupMenuItem[];
    usageText?: string;
    modelLabel?: string;
    onSend?: () => void;
    sendDisabled?: boolean;
    textareaClassName?: string;
  };
