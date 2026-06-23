"use client";

import { ArrowRightLeftIcon, EllipsisVerticalIcon, ShieldIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MemberActionsMenuProps = {
  variant?: "active" | "pending";
  removeLabel?: "Remove" | "Leave workspace";
  onManageAccess?: () => void;
  onTransferOwnership?: () => void;
  onRemove?: () => void;
  onRevoke?: () => void;
  onViewInviteDetails?: () => void;
  disabled?: boolean;
  className?: string;
};

export function MemberActionsMenu({
  variant = "active",
  removeLabel = "Remove",
  onManageAccess,
  onTransferOwnership,
  onRemove,
  onRevoke,
  onViewInviteDetails,
  disabled = false,
  className,
}: MemberActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("shrink-0 rounded-full", className)}
          disabled={disabled}
        >
          <EllipsisVerticalIcon className="size-4" />
          <span className="sr-only">Member actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {variant === "active" && onTransferOwnership ? (
          <DropdownMenuItem onClick={onTransferOwnership}>
            <ArrowRightLeftIcon className="size-4" data-icon="inline-start" />
            Transfer ownership
          </DropdownMenuItem>
        ) : null}
        {variant === "active" && onManageAccess ? (
          <DropdownMenuItem onClick={onManageAccess}>
            <ShieldIcon className="size-4" data-icon="inline-start" />
            Manage access
          </DropdownMenuItem>
        ) : null}
        {variant === "pending" && onViewInviteDetails ? (
          <DropdownMenuItem onClick={onViewInviteDetails}>View code & link</DropdownMenuItem>
        ) : null}
        {variant === "active" && onRemove ? (
          <DropdownMenuItem onClick={onRemove} variant="destructive">
            {removeLabel}
          </DropdownMenuItem>
        ) : null}
        {variant === "pending" && onRevoke ? (
          <DropdownMenuItem onClick={onRevoke} variant="destructive">
            Revoke
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
