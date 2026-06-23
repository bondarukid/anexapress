"use client";

import * as React from "react";
import { PaperclipIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  formatFileSize,
  supportTicketAttachmentConstraints,
  supportTicketAttachmentHint,
} from "@/lib/help/support-ticket";
import { cn } from "@/lib/utils";

export type SupportTicketAttachmentsProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  hint?: string;
  maxFiles?: number;
  maxFileSizeBytes?: number;
  className?: string;
};

function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex === -1 ? "" : name.slice(dotIndex).toLowerCase();
}

export function SupportTicketAttachments({
  files,
  onFilesChange,
  hint = supportTicketAttachmentHint,
  maxFiles = supportTicketAttachmentConstraints.maxFiles,
  maxFileSizeBytes = supportTicketAttachmentConstraints.maxFileSizeBytes,
  className,
}: SupportTicketAttachmentsProps) {
  const toast = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const allowedExtensions = supportTicketAttachmentConstraints.allowedExtensions;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;
    if (!selected?.length) return;

    const nextFiles = [...files];
    const rejected: string[] = [];

    for (const file of Array.from(selected)) {
      if (nextFiles.length >= maxFiles) {
        rejected.push(`${file.name} (file limit reached)`);
        continue;
      }

      if (file.size > maxFileSizeBytes) {
        rejected.push(`${file.name} (exceeds ${formatFileSize(maxFileSizeBytes)})`);
        continue;
      }

      const extension = getFileExtension(file.name);
      if (extension && !allowedExtensions.includes(extension)) {
        rejected.push(`${file.name} (unsupported format)`);
        continue;
      }

      nextFiles.push(file);
    }

    if (rejected.length > 0) {
      toast.error(
        rejected.length === 1 ? rejected[0] : `${rejected.length} files could not be attached.`,
        { id: "support-ticket-attachments" },
      );
    }

    if (nextFiles.length !== files.length) {
      onFilesChange(nextFiles);
    }

    event.target.value = "";
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={allowedExtensions.join(",")}
          className="sr-only"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={files.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
        >
          <PaperclipIcon />
          Attach Files
        </Button>
        <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
      </div>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
