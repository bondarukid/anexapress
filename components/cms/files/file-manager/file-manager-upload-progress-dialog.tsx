"use client";

import { Check, Circle, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogAnchor,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/help/support-ticket";
import { cn } from "@/lib/utils";

import type { UploadFileProgressItem, UploadFileStatus } from "./file-manager-upload-types";

type FileManagerUploadProgressDialogProps = {
  open: boolean;
  items: UploadFileProgressItem[];
  isActive: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
};

function getProgressValue(status: UploadFileStatus): number {
  if (status === "success") return 100;
  if (status === "uploading") return 50;
  if (status === "error") return 100;
  return 0;
}

function getProgressClass(status: UploadFileStatus): string {
  if (status === "success") {
    return "[&_[data-slot=progress-indicator]]:bg-green-500";
  }
  if (status === "error") {
    return "[&_[data-slot=progress-indicator]]:bg-destructive";
  }
  return "";
}

function StatusIcon({ status }: { status: UploadFileStatus }) {
  if (status === "uploading") {
    return <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />;
  }
  if (status === "success") {
    return <Check className="size-4 shrink-0 text-green-600" />;
  }
  if (status === "error") {
    return <X className="text-destructive size-4 shrink-0" />;
  }
  return <Circle className="text-muted-foreground/50 size-4 shrink-0" />;
}

function UploadProgressRow({ item }: { item: UploadFileProgressItem }) {
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-start gap-2">
        <StatusIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-medium">{item.name}</p>
            {item.size > 0 ? (
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatFileSize(item.size)}
              </span>
            ) : null}
          </div>
          {item.status === "error" && item.error ? (
            <p className="text-destructive mt-0.5 text-xs">{item.error}</p>
          ) : null}
        </div>
      </div>
      <Progress
        value={getProgressValue(item.status)}
        className={cn("h-1", getProgressClass(item.status))}
      />
    </div>
  );
}

/**
 * Modal dialog showing step-by-step upload progress for each file.
 */
export function FileManagerUploadProgressDialog({
  open,
  items,
  isActive,
  onOpenChange,
  onDone,
}: FileManagerUploadProgressDialogProps) {
  const total = items.length;
  const successCount = items.filter((item) => item.status === "success").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const finishedCount = successCount + errorCount;
  const overallPercent = total > 0 ? Math.round((finishedCount / total) * 100) : 0;
  const isComplete = total > 0 && finishedCount === total;

  let summary = `${finishedCount} of ${total} completed`;
  if (isComplete && errorCount > 0) {
    summary = `${successCount} uploaded, ${errorCount} failed`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogAnchor />
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(event) => {
          if (isActive) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isActive) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{isActive ? "Uploading files" : "Upload complete"}</DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-medium">
                {successCount} / {total} files
              </span>
            </div>
            <Progress value={overallPercent} className="h-2" />
          </div>

          <div className="divide-border max-h-64 divide-y overflow-y-auto pr-1">
            {items.map((item) => (
              <UploadProgressRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onDone} disabled={!isComplete}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
