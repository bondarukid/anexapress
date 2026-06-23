"use client";

import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroupButton } from "@/components/ui/input-group";
import type { InputGroupMenuItem } from "@/components/inputs/input-groups/types";

type InputGroupDropdownMenuProps = {
  align?: "center" | "end" | "start";
  children: ReactNode;
  className?: string;
  items: InputGroupMenuItem[];
  side?: "bottom" | "left" | "right" | "top";
};

export function InputGroupDropdownMenu({
  align = "start",
  children,
  className,
  items,
  side = "top",
}: InputGroupDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className} side={side}>
        <DropdownMenuGroup>
          {items.map((item) => (
            <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type InputGroupGhostMenuButtonProps = {
  ariaLabel?: string;
  className?: string;
  label?: string;
  textClassName?: string;
};

export function InputGroupGhostMenuButton({
  ariaLabel,
  className,
  label,
  textClassName,
}: InputGroupGhostMenuButtonProps) {
  if (label) {
    return (
      <InputGroupButton className={textClassName} type="button" variant="ghost">
        {label}
      </InputGroupButton>
    );
  }

  return (
    <InputGroupButton
      aria-label={ariaLabel}
      className={className}
      size="icon-xs"
      type="button"
      variant="ghost"
    />
  );
}
