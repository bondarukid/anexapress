import type {
  BaseComboboxProps,
  ComboboxSingleValueProps,
  ComboboxSize,
} from "@/components/comboboxes/types/combobox.types";

export type StandardComboboxVariant =
  | "simpleSingleSelect"
  | "withDefaultSelectedValue"
  | "withItemIcons"
  | "smallSizeVariant"
  | "largeSizeVariant"
  | "disabledState"
  | "fullWidthVariant";

export type StandardComboboxProps = BaseComboboxProps &
  ComboboxSingleValueProps & {
    variant?: StandardComboboxVariant;
    size?: ComboboxSize;
    fullWidth?: boolean;
    triggerWidthClassName?: string;
  };
