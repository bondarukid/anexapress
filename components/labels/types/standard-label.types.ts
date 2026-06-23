import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge";
import type { Label } from "@/components/ui/label";
import type { BaseLabelLayoutProps } from "@/components/labels/types/label.types";

export type StandardLabelVariant =
  | "standard"
  | "required"
  | "description"
  | "tooltip"
  | "badge"
  | "optional"
  | "characterCount"
  | "error"
  | "section";

export type StandardLabelProps = ComponentProps<typeof Label> &
  BaseLabelLayoutProps & {
    variant?: StandardLabelVariant;
    description?: string;
    tooltip?: string;
    badge?: string;
    badgeVariant?: VariantProps<typeof badgeVariants>["variant"];
    optionalText?: string;
    currentCount?: number;
    maxCount?: number;
    characterCount?: string;
    errorMessage?: string;
    tooltipAriaLabel?: string;
  };
