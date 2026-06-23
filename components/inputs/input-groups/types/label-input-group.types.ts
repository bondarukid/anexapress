import type {
  BaseInputGroupProps,
  InputGroupCountProps,
  InputGroupMixedControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type LabelInputGroupVariant =
  | "inlineLabels"
  | "labelTooltip"
  | "blockLabels"
  | "labelCounter";

export type LabelInputGroupProps = BaseInputGroupProps &
  InputGroupMixedControlProps &
  InputGroupCountProps & {
    variant?: LabelInputGroupVariant;
    label?: string;
    tooltip?: string;
    description?: string;
    tooltipAriaLabel?: string;
  };
