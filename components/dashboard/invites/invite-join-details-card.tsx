"use client";

import { KeyRoundIcon } from "lucide-react";

import { InviteCopyField } from "@/components/dashboard/invites/invite-copy-field";
import { Card, CardContent } from "@/components/ui/card";

type InviteJoinDetailsCardProps = {
  joinCode: string;
  inviteUrl: string | null;
};

export function InviteJoinDetailsCard({ joinCode, inviteUrl }: InviteJoinDetailsCardProps) {
  return (
    <Card className="border-primary/15 from-muted/40 to-muted/10 w-full max-w-md bg-gradient-to-b shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 px-5 py-5">
        <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
          <KeyRoundIcon className="size-5" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">Alternative ways to join</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Paste the code under Add workspace → Join, or open the invite link in your browser.
          </p>
        </div>
        <div className="w-full space-y-3">
          <InviteCopyField label="Join code" value={joinCode} monospace />
          {inviteUrl ? <InviteCopyField label="Invite link" value={inviteUrl} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
