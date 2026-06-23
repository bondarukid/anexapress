"use client";

import * as React from "react";

import { LinkedAccountItem } from "@/components/dashboard/settings/account/profile-settings/linked-accounts/linked-account-item";
import { enrichLoginMethodCards } from "@/lib/auth/login-method-icons";
import { cn } from "@/lib/utils";
import type { LoginMethodAction, LoginMethodCardSnapshot } from "@/types/auth";

export type LinkedAccountsBlockProps = {
  cards: LoginMethodCardSnapshot[];
  onAction: (methodId: LoginMethodCardSnapshot["id"], action: LoginMethodAction) => void;
  pendingId?: LoginMethodCardSnapshot["id"] | null;
  className?: string;
};

export function LinkedAccountsBlock({
  cards,
  onAction,
  pendingId = null,
  className,
}: LinkedAccountsBlockProps) {
  const cardsWithIcons = React.useMemo(() => enrichLoginMethodCards(cards), [cards]);

  const connectedCount = React.useMemo(
    () => cards.filter((card) => card.connected).length,
    [cards],
  );

  return (
    <section className={cn("w-full", className)}>
      <p className="text-muted-foreground mb-4 text-sm tabular-nums">
        {connectedCount} of {cards.length} connected
      </p>

      <div role="list" className="flex flex-col gap-3">
        {cardsWithIcons.map((card) => (
          <LinkedAccountItem
            key={card.id}
            card={card}
            pending={pendingId === card.id}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}
