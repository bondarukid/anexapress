"use client";

import type { ComponentProps, ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ComboboxSize } from "@/components/comboboxes/types";
import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";

const triggerSizeClasses: Record<ComboboxSize, string> = {
  sm: "h-8 text-xs",
  default: "h-9 text-sm",
  lg: "h-12 text-base",
};

type ComboboxPopoverShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  containerClassName?: string;
  commandProps?: ComponentProps<typeof Command>;
};

export function ComboboxPopoverShell({
  open,
  onOpenChange,
  trigger,
  children,
  contentClassName,
  containerClassName,
  commandProps,
}: ComboboxPopoverShellProps) {
  return (
    <div className={containerClassName}>
      <Popover onOpenChange={onOpenChange} open={open}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className={cn("z-[200] w-[250px] p-0", contentClassName)}>
          <Command {...commandProps} className={cn(!open && "hidden", commandProps?.className)}>
            {children}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

type ComboboxTriggerButtonProps = {
  open: boolean;
  disabled?: boolean;
  className?: string;
  size?: ComboboxSize;
  fullWidth?: boolean;
  widthClassName?: string;
  children: ReactNode;
  trailing?: ReactNode;
};

export function ComboboxTriggerButton({
  open,
  disabled,
  className,
  size = "default",
  fullWidth,
  widthClassName = "w-[200px]",
  children,
  trailing,
}: ComboboxTriggerButtonProps) {
  return (
    <Button
      aria-expanded={open}
      className={cn(
        "justify-between",
        triggerSizeClasses[size],
        fullWidth ? "w-full" : widthClassName,
        className,
      )}
      disabled={disabled}
      role="combobox"
      type="button"
      variant="outline"
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      {trailing ?? <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />}
    </Button>
  );
}

type ComboboxCommandListProps = {
  searchPlaceholder?: string;
  emptyMessage?: string;
  children: ReactNode;
  listFooter?: ReactNode;
  commandInputProps?: ComponentProps<typeof CommandInput>;
  hideEmpty?: boolean;
};

export function ComboboxCommandList({
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  children,
  listFooter,
  commandInputProps,
  hideEmpty,
}: ComboboxCommandListProps) {
  return (
    <>
      <CommandInput placeholder={searchPlaceholder} {...commandInputProps} />
      <CommandList>
        {hideEmpty ? null : <CommandEmpty>{emptyMessage}</CommandEmpty>}
        {children}
      </CommandList>
      {listFooter}
    </>
  );
}

export function ComboboxFooterActions({
  actions,
  className,
}: {
  actions: Array<{ label: string; icon?: ComponentType<{ className?: string }>; onClick?: () => void }>;
  className?: string;
}) {
  return (
    <div className={cn("p-1", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            className="w-full justify-start text-xs"
            key={action.label}
            onClick={action.onClick}
            type="button"
            variant="ghost"
          >
            {Icon ? <Icon className="mr-2 size-3" /> : null}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
