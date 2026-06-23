import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DrawerDirection = "bottom" | "left" | "right" | "top";

/**
 * Shared props for all Kibo UI drawer category components.
 */
export type BaseDrawerProps = {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  triggerAsChild?: boolean;
  dismissible?: boolean;
  shouldScaleBackground?: boolean;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  onActiveSnapPointChange?: (snap: number | string | null) => void;
  defaultTriggerLabel?: string;
};

export type DrawerFormField = {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea";
  defaultValue?: string;
  placeholder?: string;
};

export type DrawerNavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
};

export type DrawerNavGroup = {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: DrawerNavItem[];
};

export type DrawerFileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: DrawerFileNode[];
};

export type DrawerFilterOption = {
  id: string;
  label: string;
  checked?: boolean;
};

export type DrawerFilterSection = {
  id: string;
  label: string;
  options: DrawerFilterOption[];
};

export type DrawerSettingItem = {
  id: string;
  label: string;
  description?: string;
  checked?: boolean;
};

export type DrawerSettingGroup = {
  id: string;
  label: string;
  items: DrawerSettingItem[];
};

export type DrawerCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type DrawerNotificationItem = {
  id: string;
  title: string;
  message: string;
  time?: string;
  read?: boolean;
};

export type DrawerQuickAction = {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
};

export type DrawerCommandItem = {
  id: string;
  label: string;
  shortcut?: string;
  onSelect?: () => void;
};

export type DrawerEventAction = {
  id: string;
  label: string;
  variant?: "default" | "outline" | "secondary";
  onClick?: () => void;
};
