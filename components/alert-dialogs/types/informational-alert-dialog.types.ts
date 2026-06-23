import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type InformationalIconLayout = "none" | "inline" | "centered";

export type InformationalIconVariant = "default" | "informationalCircle";

export type InformationalBadgeVariant = "default" | "info";

export type InformationalAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconLayout?: InformationalIconLayout;
  iconVariant?: InformationalIconVariant;
  iconClassName?: string;
  badge?: ReactNode;
  badgeVariant?: InformationalBadgeVariant;
  body?: ReactNode;
  showCancel?: boolean;
  cancelLabel?: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  onCancel?: () => void;
  actionLoading?: boolean;
  actionDisabled?: boolean;
  cancelDisabled?: boolean;
  actionClassName?: string;
  headerClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};
