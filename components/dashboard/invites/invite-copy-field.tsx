"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { toast } from "@/components/toasts";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InviteCopyFieldProps = {
  label: string;
  value: string;
  monospace?: boolean;
  className?: string;
};

export function InviteCopyField({
  label,
  value,
  monospace = false,
  className,
}: InviteCopyFieldProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="flex items-stretch gap-2">
        <div
          className={cn(
            "bg-background flex min-w-0 flex-1 items-center rounded-lg border px-3 py-2.5 text-sm shadow-xs",
            monospace && "justify-center font-mono text-base tracking-[0.2em]",
          )}
        >
          <span className={cn(!monospace && "truncate")}>{value}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => void handleCopy()}
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckIcon className="text-primary size-4" /> : <CopyIcon className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
