"use client";

import { CheckIcon, Loader2Icon } from "lucide-react";

import { LoginMethodIconFrame } from "@/components/dashboard/settings/account/profile-settings/linked-accounts/login-method-icon-frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LoginMethodAction, LoginMethodCardState } from "@/types/auth";

export type LinkedAccountItemProps = {
  card: LoginMethodCardState;
  onAction: (methodId: LoginMethodCardState["id"], action: LoginMethodAction) => void;
  pending?: boolean;
  className?: string;
};

const ACTION_LABELS: Record<LoginMethodAction, string> = {
  connect: "Connect",
  disconnect: "Disconnect",
  "setup-email": "Set up email login",
  none: "Configured",
};

function resolveButtonLabel(card: LoginMethodCardState): string {
  if (card.action === "none" && card.connected) {
    return card.id === "email" ? "Configured" : "Connected";
  }
  return ACTION_LABELS[card.action];
}

export function LinkedAccountItem({
  card,
  onAction,
  pending = false,
  className,
}: LinkedAccountItemProps) {
  const label = resolveButtonLabel(card);
  const isDisabled = card.action === "none" || pending;
  const showCheck = card.connected && card.action !== "disconnect";

  const handleClick = () => {
    if (isDisabled || card.action === "none") return;
    onAction(card.id, card.action);
  };

  return (
    <article
      role="listitem"
      className={cn(
        "border-border bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <LoginMethodIconFrame
          Icon={card.icon}
          brandColor={card.id === "github" ? undefined : card.brandColor}
          iconClassName={card.id === "github" ? "text-foreground" : undefined}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-heading text-base leading-snug font-medium tracking-tight">
            {card.title}
          </h3>
          {card.accountLabel ? (
            <p className="text-foreground text-sm font-medium">{card.accountLabel}</p>
          ) : null}
          <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>
        </div>
      </div>

      <Button
        type="button"
        variant={
          card.action === "disconnect" ? "outline" : card.connected ? "secondary" : "outline"
        }
        size="sm"
        className="w-full shrink-0 sm:w-auto"
        disabled={isDisabled}
        aria-pressed={card.connected}
        aria-label={`${card.title}: ${label}`}
        onClick={handleClick}
      >
        {pending ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden />
            {label}
          </>
        ) : showCheck ? (
          <>
            <CheckIcon aria-hidden />
            {label}
          </>
        ) : (
          label
        )}
      </Button>
    </article>
  );
}
