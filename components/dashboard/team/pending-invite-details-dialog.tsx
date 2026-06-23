"use client";

import { InviteCreatedSuccess } from "@/components/dashboard/invites/invite-created-success";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TeamPendingInvite } from "@/types/team";

type PendingInviteDetailsDialogProps = {
  invite: TeamPendingInvite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PendingInviteDetailsDialog({
  invite,
  open,
  onOpenChange,
}: PendingInviteDetailsDialogProps) {
  if (!invite) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent className="flex max-h-[min(640px,calc(100vh-2rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="bg-muted/20 shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle className="sr-only">Invitation details</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <InviteCreatedSuccess
            payload={{
              joinCode: invite.joinCode,
              inviteUrl: invite.inviteUrl ?? "",
              expiresAt: invite.expiresAt,
              inviteId: invite.id,
            }}
            title="Invitation details"
            description={`Share the join code or link with ${invite.email}. They can also accept from notifications if they already have an account.`}
          />
        </div>
        <DialogFooter className="bg-muted/40 mx-0 mb-0 gap-2 rounded-b-xl border-t px-6 pt-4 pb-6 sm:justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
