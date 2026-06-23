import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ComboboxStatus = "online" | "offline" | "busy";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
  description?: string;
  metadata?: string;
  avatarUrl?: string;
  status?: ComboboxStatus;
  color?: string;
  favorite?: boolean;
};

export type ComboboxGroupOption = {
  label: string;
  options: ComboboxOption[];
  count?: number;
};

export type ComboboxNestedGroupOption = {
  label: string;
  options: ComboboxOption[];
  children?: ComboboxGroupOption[];
};

export type ComboboxSize = "sm" | "default" | "lg";

export type ComboboxFooterAction = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
};

export type ComboboxFilterOption = {
  label: string;
  value: string;
};

export type ComboboxShortcutOption = {
  label: string;
  shortcut: string;
};

/**
 * Shared props for all Kibo UI combobox category components.
 */
export type BaseComboboxProps = {
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  options?: ComboboxOption[];
  groups?: ComboboxGroupOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ComboboxSingleValueProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export type ComboboxMultiValueProps = {
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
};

export type ComboboxRenderItemProps = {
  option: ComboboxOption;
  selected: boolean;
  onSelect: (value: string) => void;
};

export type ComboboxItemRenderer = (props: ComboboxRenderItemProps) => ReactNode;
