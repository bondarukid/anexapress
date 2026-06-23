import type {
  BaseInputGroupProps,
  InputGroupCountProps,
  InputGroupMenuItem,
  InputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type TextareaInputGroupVariant =
  | "codeEditor"
  | "characterCounter"
  | "richTextToolbar"
  | "chatInput";

export type TextareaInputGroupProps = BaseInputGroupProps &
  InputGroupTextareaControlProps &
  InputGroupCountProps & {
    variant?: TextareaInputGroupVariant;
    languageLabel?: string;
    toolbarItems?: InputGroupMenuItem[];
    onSend?: () => void;
    textareaClassName?: string;
  };
