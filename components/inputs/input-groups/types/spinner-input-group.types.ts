import type {
  BaseInputGroupProps,
  InputGroupMixedControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type SpinnerInputGroupVariant =
  | "loadingStates"
  | "spinnerText"
  | "animatedIcon"
  | "textareaLoading";

export type SpinnerInputGroupProps = BaseInputGroupProps &
  InputGroupMixedControlProps & {
    variant?: SpinnerInputGroupVariant;
    isLoading?: boolean;
    loadingText?: string;
    textareaClassName?: string;
  };
