import type {
  BaseInputGroupProps,
  InputGroupInputControlProps,
} from "@/components/inputs/input-groups/types/input-group.types";

export type ButtonsInputGroupVariant =
  | "copy"
  | "multipleActions"
  | "search"
  | "passwordActions";

export type ButtonsInputGroupProps = BaseInputGroupProps &
  InputGroupInputControlProps & {
    variant?: ButtonsInputGroupVariant;
    copied?: boolean;
    onCopiedChange?: (copied: boolean) => void;
    onCopy?: () => void;
    onSearch?: () => void;
    favorited?: boolean;
    onFavoritedChange?: (favorited: boolean) => void;
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    onRegenerate?: () => void;
    copyAriaLabel?: string;
    searchAriaLabel?: string;
  };
