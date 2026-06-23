"use client";

/**
 * Presentational workspace invite card for public landing and notifications mail.
 * Used by `InviteLandingCard` and `MailDisplay` — callers supply real invite data via props.
 */

import * as React from "react";
import { useToast } from "@/hooks/use-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AcceptInviteProps = {
  hostName?: string;
  hostAvatarUrl?: string | null;
  hostInitial?: string;
  workspaceName?: string;
  description?: string;
  acceptLabel?: string;
  declineLabel?: string;
  expirationText?: string;
  onAccept?: () => void | Promise<void>;
  onDecline?: () => void | Promise<void>;
  className?: string;
};

export function AcceptInvite({
  hostName = "Sarah Chen",
  hostAvatarUrl = null,
  hostInitial,
  workspaceName = "Acme Inc",
  description = "Join your team to track emissions, manage access, and stay aligned on reporting.",
  acceptLabel = "Accept invite",
  declineLabel = "Decline",
  expirationText = "This invitation expires in 7 days.",
  onAccept,
  onDecline,
  className,
}: AcceptInviteProps) {
  const toast = useToast();
  const [isPending, setIsPending] = React.useState(false);

  const initial = hostInitial ?? (hostName.trim().charAt(0).toUpperCase() || "?");

  async function handleAccept() {
    setIsPending(true);
    try {
      if (onAccept) {
        await onAccept();
      } else {
        toast.success(`You joined ${workspaceName}`);
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleDecline() {
    setIsPending(true);
    try {
      if (onDecline) {
        await onDecline();
      } else {
        toast.info("Invitation declined");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className={cn("flex w-full items-center justify-center", className)}>
      <Card className="ring-border w-full max-w-md shadow-lg ring-1">
        <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center">
          <Avatar className="size-20 after:border-0">
            {hostAvatarUrl ? <AvatarImage src={hostAvatarUrl} alt={hostName} /> : null}
            <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-semibold">{hostName}</span> invited you to join
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{workspaceName}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>

          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={handleDecline}
            >
              {declineLabel}
            </Button>
            <Button type="button" className="flex-1" disabled={isPending} onClick={handleAccept}>
              {acceptLabel}
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">{expirationText}</p>
        </CardContent>
      </Card>
    </section>
  );
}
