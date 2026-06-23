"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type InputGroupShellProps = ComponentProps<typeof InputGroup> & {
  containerClassName?: string;
  maxWidthClassName?: string;
};

export function InputGroupShell({
  className,
  containerClassName,
  maxWidthClassName = "max-w-sm",
  children,
  ...props
}: InputGroupShellProps) {
  return (
    <div className={cn("flex w-full flex-col", maxWidthClassName, containerClassName)}>
      <InputGroup className={cn("bg-background", className)} {...props}>
        {children}
      </InputGroup>
    </div>
  );
}

type InputGroupWideShellProps = InputGroupShellProps;

export function InputGroupWideShell({
  maxWidthClassName = "max-w-2xl",
  ...props
}: InputGroupWideShellProps) {
  return <InputGroupShell maxWidthClassName={maxWidthClassName} {...props} />;
}

type InputGroupCharacterCountProps = {
  className?: string;
  current?: number;
  max?: number;
  label?: string;
};

export function InputGroupCharacterCount({
  className,
  current = 0,
  max,
  label,
}: InputGroupCharacterCountProps) {
  const value = label ?? (max !== undefined ? `${current}/${max}` : `${current}`);

  return <InputGroupText className={className}>{value}</InputGroupText>;
}

type InputGroupVerticalSeparatorProps = {
  className?: string;
};

export function InputGroupVerticalSeparator({ className }: InputGroupVerticalSeparatorProps) {
  return <Separator className={cn("!h-4", className)} orientation="vertical" />;
}

type InputGroupBlockEndAddonProps = {
  children: ReactNode;
  className?: string;
};

export function InputGroupBlockEndAddon({ children, className }: InputGroupBlockEndAddonProps) {
  return <InputGroupAddon align="block-end" className={className}>{children}</InputGroupAddon>;
}

type InputGroupInlineEndAddonProps = {
  children: ReactNode;
  className?: string;
};

export function InputGroupInlineEndAddon({ children, className }: InputGroupInlineEndAddonProps) {
  return <InputGroupAddon align="inline-end" className={className}>{children}</InputGroupAddon>;
}

type InputGroupInlineStartAddonProps = {
  children: ReactNode;
  className?: string;
};

export function InputGroupInlineStartAddon({ children, className }: InputGroupInlineStartAddonProps) {
  return <InputGroupAddon align="inline-start" className={className}>{children}</InputGroupAddon>;
}

type InputGroupBlockStartAddonProps = {
  children: ReactNode;
  className?: string;
};

export function InputGroupBlockStartAddon({ children, className }: InputGroupBlockStartAddonProps) {
  return <InputGroupAddon align="block-start" className={className}>{children}</InputGroupAddon>;
}

export function formatInputGroupCount(
  countLabel: string | undefined,
  currentCount: number | undefined,
  maxCount: number | undefined,
) {
  if (countLabel) {
    return countLabel;
  }

  if (currentCount !== undefined && maxCount !== undefined) {
    return `${currentCount}/${maxCount}`;
  }

  return undefined;
}
