import type { LucideIcon } from "lucide-react";

import type {
  BaseInputGroupProps,
  InputGroupInputControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type IconsInputGroupVariant =
  | "searchIcon"
  | "contactFields"
  | "dualIcons"
  | "multipleIcons";

export type IconsInputGroupField = {
  id: string;
  placeholder: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  type?: string;
};

export type IconsInputGroupProps = BaseInputGroupProps &
  InputGroupInputControlProps & {
    variant?: IconsInputGroupVariant;
    leadingIcon?: LucideIcon;
    trailingIcon?: LucideIcon;
    fields?: IconsInputGroupField[];
    onTrailingClick?: () => void;
    trailingAriaLabel?: string;
  };
