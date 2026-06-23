"use client";

import { format } from "date-fns";
import { CheckIcon, SparklesIcon } from "lucide-react";
import * as React from "react";
import { toast } from "@/components/toasts";

import { InviteCopyField } from "@/components/dashboard/invites/invite-copy-field";
import { Button } from "@/components/ui/button";
import type { InviteCreatedPayload } from "@/types/invite";

type InviteCreatedSuccessProps = {
  payload: InviteCreatedPayload;
  title?: string;
  description?: string;
};

export function InviteCreatedSuccess({
  payload,
  title = "Invitation ready",
  description = "Share the join code or link with your teammate.",
}: InviteCreatedSuccessProps) {
  const expiresLabel = format(new Date(payload.expiresAt), "PPP");

  async function copyAll() {
    const text = `Join code: ${payload.joinCode}\nLink: ${payload.inviteUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Code and link copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="flex flex-col gap-6 px-1 py-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="bg-primary/10 text-primary ring-primary/20 flex size-14 items-center justify-center rounded-2xl ring-1">
            <CheckIcon className="size-7" strokeWidth={2.5} />
          </div>
          <SparklesIcon className="text-primary/80 absolute -top-1 -right-1 size-4" />
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-semibold tracking-tight">{title}</p>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">{description}</p>
          <p className="text-muted-foreground text-xs">Valid until {expiresLabel}</p>
        </div>
      </div>

      <div className="bg-muted/30 space-y-4 rounded-xl border p-4">
        <InviteCopyField label="Join code" value={payload.joinCode} monospace />
        <InviteCopyField label="Invite link" value={payload.inviteUrl} />
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => void copyAll()}
        >
          Copy code and link
        </Button>
      </div>
    </div>
  );
}
