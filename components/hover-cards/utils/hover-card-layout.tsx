"use client";

import type { ReactNode } from "react";

import type { ProfileStatItem, StatItem } from "@/components/hover-cards/types/hover-card.types";
import { formatStatValue } from "@/components/hover-cards/utils/format-stat-value";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type HoverCardProfileHeaderProps = {
  name: string;
  username?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  bio?: string;
  className?: string;
  avatarSize?: "default" | "sm" | "lg";
};

export function HoverCardProfileHeader({
  name,
  username,
  avatarUrl,
  avatarFallback,
  bio,
  className,
  avatarSize = "lg",
}: HoverCardProfileHeaderProps) {
  const fallback = avatarFallback ?? name.slice(0, 2).toUpperCase();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar size={avatarSize}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold">{name}</p>
        {username ? (
          <p className="text-muted-foreground truncate text-xs">@{username}</p>
        ) : null}
        {bio ? (
          <p className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-relaxed">{bio}</p>
        ) : null}
      </div>
    </div>
  );
}

type HoverCardPreviewHeaderProps = {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  footer?: ReactNode;
  className?: string;
};

export function HoverCardPreviewHeader({
  title,
  description,
  image,
  imageAlt,
  footer,
  className,
}: HoverCardPreviewHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {image ? (
        <div className="bg-muted overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={imageAlt ?? title} className="aspect-video w-full object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{title}</p>
        {description ? (
          <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">{description}</p>
        ) : null}
        {footer}
      </div>
    </div>
  );
}

type HoverCardStatGridProps = {
  items: StatItem[] | ProfileStatItem[];
  columns?: 2 | 3;
  className?: string;
  formatValues?: boolean;
};

export function HoverCardStatGrid({
  items,
  columns = 3,
  className,
  formatValues = true,
}: HoverCardStatGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 text-center",
        columns === 2 ? "grid-cols-2" : "grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        const displayValue =
          formatValues && typeof item.value === "number"
            ? formatStatValue(item.value)
            : item.value;

        return (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold tabular-nums">{displayValue}</span>
            <span className="text-muted-foreground text-xs">{item.label}</span>
            {"sublabel" in item && item.sublabel ? (
              <span className="text-muted-foreground text-[10px]">{item.sublabel}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type HoverCardMetaListProps = {
  items: { label: string; value: string }[];
  className?: string;
};

export function HoverCardMetaList({ items, className }: HoverCardMetaListProps) {
  return (
    <dl className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
