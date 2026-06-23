import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import type { buttonVariants } from "@/components/ui/button";
import type { Item } from "@/components/ui/item";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ItemVariant = NonNullable<ComponentProps<typeof Item>["variant"]>;
type ItemSize = NonNullable<ComponentProps<typeof Item>["size"]>;

export type ItemActionConfig =
  | {
      type: "button";
      label: string;
      onClick?: () => void;
      variant?: ButtonVariant;
      size?: "default" | "sm" | "xs" | "icon" | "icon-sm";
      className?: string;
    }
  | {
      type: "icon";
      icon: LucideIcon;
      ariaLabel?: string;
      onClick?: () => void;
      variant?: ButtonVariant;
      size?: "default" | "sm" | "icon" | "icon-sm";
      className?: string;
    }
  | { type: "chevron" }
  | { type: "externalLink" };

export type ItemMediaConfig =
  | {
      type: "icon";
      icon: LucideIcon;
      iconClassName?: string;
      variant?: "icon" | "default";
    }
  | {
      type: "avatar";
      src?: string;
      fallback: string;
      className?: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      className?: string;
      width?: number;
      height?: number;
    };

export type ItemHeaderImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export type BaseItemData = {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  media?: ItemMediaConfig;
  action?: ItemActionConfig;
  size?: ItemSize;
  itemVariant?: ItemVariant;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  headerImage?: ItemHeaderImage;
  trailingContent?: {
    description?: string;
    className?: string;
  };
};
