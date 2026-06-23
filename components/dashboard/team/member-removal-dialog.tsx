"use client";

import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import type { MemberRemovalMode } from "@/types/team";

type MemberRemovalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: MemberRemovalMode;
  memberName: string;
  workspaceName: string;
  confirmLoading?: boolean;
  onConfirm: () => void;
};

export function MemberRemovalDialog({
  open,
  onOpenChange,
  mode,
  memberName,
  workspaceName,
  confirmLoading = false,
  onConfirm,
}: MemberRemovalDialogProps) {
  const isLeave = mode === "leave";

  return (
    <DestructiveAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isLeave ? "Leave workspace?" : "Remove member?"}
      description={
        isLeave
          ? `You will lose access to ${workspaceName}. You can rejoin only if another member invites you again.`
          : `${memberName} will lose access to ${workspaceName}. This action cannot be undone.`
      }
      confirmLabel={isLeave ? "Leave workspace" : "Remove member"}
      onConfirm={onConfirm}
      confirmLoading={confirmLoading}
      cancelDisabled={confirmLoading}
    />
  );
}
