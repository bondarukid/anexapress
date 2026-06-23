import type { ReactNode } from "react";

import type {
  BaseInputGroupProps,
  InputGroupInputControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type TooltipInputGroupVariant =
  | "passwordRequirements"
  | "helpTooltips"
  | "apiKeyInfo";

export type TooltipInputGroupProps = BaseInputGroupProps &
  InputGroupInputControlProps & {
    variant?: TooltipInputGroupVariant;
    tooltipContent?: ReactNode;
    requirements?: string[];
    tooltipAriaLabel?: string;
  };
