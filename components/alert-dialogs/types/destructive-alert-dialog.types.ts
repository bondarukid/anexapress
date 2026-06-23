import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type DestructiveIconLayout = "none" | "inline" | "centered";

export type DestructiveIconVariant = "default" | "destructiveCircle";

export type DestructiveConfirmationCheckbox = {
  id?: string;
  label: string;
};

export type DestructiveAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconLayout?: DestructiveIconLayout;
  iconVariant?: DestructiveIconVariant;
  iconClassName?: string;
  badge?: ReactNode;
  body?: ReactNode;
  confirmationCheckbox?: DestructiveConfirmationCheckbox;
  confirmationChecked?: boolean;
  onConfirmationCheckedChange?: (checked: boolean) => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmIcon?: LucideIcon;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmClassName?: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  headerClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};
