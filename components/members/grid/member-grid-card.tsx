"use client";

import type { ReactNode } from "react";

import { BadgeCheckIcon } from "@/components/dashboard/team/badge-check-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/team/data";
import { getPresenceDotClass } from "@/lib/members/presence";
import { cn } from "@/lib/utils";
import type { MemberDisplayItem } from "@/types/member-display";

export type MemberGridCardProps = {
  item: MemberDisplayItem;
  menu?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function MemberGridCard({ item, menu, footer, className }: MemberGridCardProps) {
  return (
    <Card className={cn("gap-0 p-0", className)}>
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex justify-between gap-3">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative w-fit shrink-0">
              <Avatar className="size-12">
                {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt={item.name} /> : null}
                <AvatarFallback>{getInitials(item.name)}</AvatarFallback>
              </Avatar>
              {item.verified ? (
                <span className="absolute -top-1.5 -right-1.5">
                  <span className="sr-only">Verified</span>
                  <BadgeCheckIcon />
                </span>
              ) : null}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-medium">{item.name}</h3>
              {item.subtitle ? (
                <p className="text-muted-foreground truncate text-sm">{item.subtitle}</p>
              ) : null}
              {item.badges && item.badges.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.badges.map((badge) => (
                    <Badge key={badge.id} variant="secondary">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {menu ? <div className="shrink-0">{menu}</div> : null}
        </div>

        {item.presence ? (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn("size-2 rounded-full", getPresenceDotClass(item.presence.tone))}
            />
            <span className="text-muted-foreground text-sm">{item.presence.label}</span>
          </div>
        ) : null}

        {footer ? <div className="mt-4 border-t pt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
