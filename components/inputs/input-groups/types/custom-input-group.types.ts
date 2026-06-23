import type {
  BaseInputGroupProps,
  InputGroupCountProps,
  InputGroupMenuItem,
  InputGroupTextareaControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type CustomInputGroupVariant =
  | "textareaActions"
  | "textareaCounter"
  | "textareaToolbar"
  | "textareaLabel";

export type CustomInputGroupProps = BaseInputGroupProps &
  InputGroupTextareaControlProps &
  InputGroupCountProps & {
    variant?: CustomInputGroupVariant;
    label?: string;
    onSubmit?: () => void;
    submitLabel?: string;
    toolbarItems?: InputGroupMenuItem[];
    textareaClassName?: string;
  };
