"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ComboboxOption, ComboboxStatus } from "@/components/comboboxes/types";
import { cn } from "@/lib/utils";

const statusColorClasses: Record<ComboboxStatus, string> = {
  online: "bg-emerald-500",
  offline: "bg-muted-foreground",
  busy: "bg-amber-500",
};

export function ComboboxStatusDot({
  status = "offline",
  className,
}: {
  status?: ComboboxStatus;
  className?: string;
}) {
  return <span className={cn("size-2 shrink-0 rounded-full", statusColorClasses[status], className)} />;
}

export function ComboboxAvatarItemContent({ option }: { option: ComboboxOption }) {
  return (
    <>
      <Avatar className="mr-2 size-5">
        {option.avatarUrl ? <AvatarImage alt={option.label} src={option.avatarUrl} /> : null}
        <AvatarFallback>{option.label.charAt(0)}</AvatarFallback>
      </Avatar>
      {option.label}
    </>
  );
}

export function ComboboxDescriptionItemContent({ option }: { option: ComboboxOption }) {
  return (
    <div className="flex flex-col">
      <span>{option.label}</span>
      {option.description ? (
        <span className="text-muted-foreground text-xs">{option.description}</span>
      ) : null}
    </div>
  );
}

export function ComboboxMetadataItemContent({ option }: { option: ComboboxOption }) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex flex-col">
        <span>{option.label}</span>
        {option.description ? (
          <span className="text-muted-foreground text-xs">{option.description}</span>
        ) : null}
      </div>
      {option.metadata ? (
        <span className="text-muted-foreground text-xs">{option.metadata}</span>
      ) : null}
    </div>
  );
}

export function ComboboxIconDescriptionItemContent({ option }: { option: ComboboxOption }) {
  const Icon = option.icon;
  return (
    <div className="flex items-start gap-2">
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="flex flex-col">
        <span>{option.label}</span>
        {option.description ? (
          <span className="text-muted-foreground text-xs">{option.description}</span>
        ) : null}
      </div>
    </div>
  );
}

export function ComboboxColorItemContent({ option }: { option: ComboboxOption }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: option.color ?? "currentColor" }}
      />
      {option.label}
    </div>
  );
}

export function ComboboxStatusItemContent({
  option,
  statusLabels,
}: {
  option: ComboboxOption;
  statusLabels?: Partial<Record<ComboboxStatus, string>>;
}) {
  const status = option.status ?? "offline";
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span>{option.label}</span>
      <div className="flex items-center gap-1.5">
        <ComboboxStatusDot status={status} />
        <span className="text-muted-foreground text-xs">{statusLabels?.[status] ?? status}</span>
      </div>
    </div>
  );
}

export function ComboboxActionItemContent({
  option,
  actionLabel = "Open",
  onAction,
}: {
  option: ComboboxOption;
  actionLabel?: string;
  onAction?: (value: string) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span>{option.label}</span>
      <Button
        className="h-7 px-2 text-xs"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onAction?.(option.value);
        }}
        size="sm"
        type="button"
        variant="ghost"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

export function ComboboxAvatarTriggerContent({ option }: { option: ComboboxOption }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-5">
        {option.avatarUrl ? <AvatarImage alt={option.label} src={option.avatarUrl} /> : null}
        <AvatarFallback>{option.label.charAt(0)}</AvatarFallback>
      </Avatar>
      {option.label}
    </div>
  );
}
