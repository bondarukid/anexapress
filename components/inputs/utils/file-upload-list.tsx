"use client";

import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadListProps = {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
};

/**
 * Uploaded files list matching Kibo special-1 pattern.
 */
export function FileUploadList({ files, onRemove, className }: FileUploadListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {files.map((file, index) => (
        <div
          className="flex items-center justify-between rounded-md border p-2"
          key={`${file.name}-${file.size}-${index}`}
        >
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-sm">{file.name}</span>
            <span className="text-muted-foreground text-xs">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <Button
            aria-label={`Remove ${file.name}`}
            className="size-6"
            onClick={() => onRemove(index)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-3" data-icon="inline-start" />
          </Button>
        </div>
      ))}
    </div>
  );
}
