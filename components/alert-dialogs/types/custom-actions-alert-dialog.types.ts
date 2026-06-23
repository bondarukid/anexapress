import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

export type CustomActionKind = "cancel" | "action" | "button";

export type CustomActionPosition = "default" | "leading" | "trailing";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

export type CustomAction = {
  label: string;
  kind?: CustomActionKind;
  position?: CustomActionPosition;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
};

export type CustomActionsFooterLayout =
  | "horizontal"
  | "vertical"
  | "splitBetween"
  | "splitLeading";

export type CustomActionsIconLayout = "none" | "inline" | "centered";

export type CustomActionsAlertDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconLayout?: CustomActionsIconLayout;
  iconClassName?: string;
  badge?: ReactNode;
  body?: ReactNode;
  actions: CustomAction[];
  footerLayout?: CustomActionsFooterLayout;
  footerClassName?: string;
  headerClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};
