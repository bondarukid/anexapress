import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type SuccessIconLayout = "none" | "inline" | "centered";

export type SuccessIconVariant = "default" | "successCircle" | "celebrationCircle";

export type SuccessAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconLayout?: SuccessIconLayout;
  iconVariant?: SuccessIconVariant;
  iconClassName?: string;
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
