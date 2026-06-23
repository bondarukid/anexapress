import type {
  BaseComboboxProps,
  ComboboxItemRenderer,
  ComboboxSingleValueProps,
  ComboboxStatus,
} from "@/components/comboboxes/types/combobox.types";

export type RichContentComboboxVariant =
  | "itemsWithAvatars"
  | "itemsWithDescriptions"
  | "itemsWithStatusIndicators"
  | "itemsWithMetadata"
  | "itemsWithIconsAndDescriptions"
  | "colorCodedItems"
  | "itemsWithActionButtons";

export type RichContentComboboxProps = BaseComboboxProps &
  ComboboxSingleValueProps & {
    variant?: RichContentComboboxVariant;
    renderItem?: ComboboxItemRenderer;
    onItemAction?: (optionValue: string) => void;
    itemActionLabel?: string;
    statusLabels?: Partial<Record<ComboboxStatus, string>>;
  };
