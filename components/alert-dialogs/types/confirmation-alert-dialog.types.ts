import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

export type ConfirmationIconLayout = "none" | "inline" | "centered";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

export type ConfirmationAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: ReactNode;
  badge?: string;
  icon?: LucideIcon;
  iconLayout?: ConfirmationIconLayout;
  iconClassName?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmVariant?: ButtonVariant;
  confirmClassName?: string;
  cancelDisabled?: boolean;
  confirmDisabled?: boolean;
  headerClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};
