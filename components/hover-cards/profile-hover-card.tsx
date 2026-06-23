"use client";

import { Calendar, MapPin } from "lucide-react";

import type { ProfileHoverCardProps } from "@/components/hover-cards/types";
import {
  HoverCardProfileHeader,
  HoverCardStatGrid,
} from "@/components/hover-cards/utils/hover-card-layout";
import { HoverCardShell } from "@/components/hover-cards/utils/hover-card-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Profile hover card covering Kibo UI profile patterns.
 * https://www.kibo-ui.com/patterns/hover-card/profile
 */
export function ProfileHoverCard({
  variant = "simpleProfile",
  trigger,
  name,
  username,
  avatarUrl,
  avatarFallback,
  bio,
  location,
  joinedAt,
  badge,
  badgeVariant = "secondary",
  stats,
  followLabel = "Follow",
  followingLabel = "Following",
  isFollowing = false,
  onFollow,
  messageLabel = "Message",
  onMessage,
  contentClassName,
  triggerAsChild,
  ...shellProps
}: ProfileHoverCardProps) {
  const resolvedContentClassName = cn(
    (variant === "withLocation" || variant === "withStats") && "w-80",
    contentClassName,
  );

  const resolvedTrigger = (() => {
    if (trigger) {
      return trigger;
    }

    return (
      <button type="button" className="text-sm font-medium hover:underline">
        @{username ?? name.toLowerCase().replace(/\s+/g, "")}
      </button>
    );
  })();

  return (
    <HoverCardShell
      {...shellProps}
      trigger={resolvedTrigger}
      triggerAsChild={triggerAsChild}
      contentClassName={resolvedContentClassName}
    >
      <div className="flex flex-col gap-3">
        <HoverCardProfileHeader
          name={name}
          username={variant !== "withLocation" ? username : undefined}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
          bio={variant === "simpleProfile" || variant === "withLocation" ? bio : undefined}
        />

        {variant === "withBadge" && badge ? (
          <Badge variant={badgeVariant} className="w-fit">
            {badge}
          </Badge>
        ) : null}

        {variant === "withLocation" ? (
          <div className="flex flex-col gap-2">
            {location ? (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <MapPin className="size-3.5 shrink-0" />
                <span>{location}</span>
              </div>
            ) : null}
            {joinedAt ? (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5 shrink-0" />
                <span>Joined {joinedAt}</span>
              </div>
            ) : null}
            {bio ? (
              <p className="text-muted-foreground text-xs leading-relaxed">{bio}</p>
            ) : null}
          </div>
        ) : null}

        {variant === "withFollowButton" ? (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              variant={isFollowing ? "outline" : "default"}
              onClick={onFollow}
            >
              {isFollowing ? followingLabel : followLabel}
            </Button>
            {onMessage ? (
              <Button type="button" size="sm" variant="outline" className="flex-1" onClick={onMessage}>
                {messageLabel}
              </Button>
            ) : null}
          </div>
        ) : null}

        {variant === "withStats" && stats && stats.length > 0 ? (
          <>
            <Separator />
            <HoverCardStatGrid items={stats} columns={3} />
          </>
        ) : null}
      </div>
    </HoverCardShell>
  );
}
