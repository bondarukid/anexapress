"use client";

import * as React from "react";
import { TrashIcon, UploadCloudIcon } from "lucide-react";

import { WorkspaceLogoMark } from "@/components/shared/workspace-logo-mark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import { cn } from "@/lib/utils";

export type AvatarUploadFieldProps = {
  label: string;
  hint?: string;
  preview: string | null;
  fallbackText: string;
  /** Round user avatar (default) or square workspace mark like the sidebar team switcher. */
  previewVariant?: "avatar" | "workspace";
  imageAlt?: string;
  uploadLabel?: string;
  disabled?: boolean;
  /** When true, shows avatar only — no upload/remove controls (e.g. read-only workspace settings). */
  readOnly?: boolean;
  isUploading?: boolean;
  onFileSelect: (file: File) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
  avatarClassName?: string;
  fallbackClassName?: string;
};

/**
 * Shared avatar upload row used in account and workspace settings.
 * Matches the personal-info settings layout: round avatar, upload + remove actions.
 */
export function AvatarUploadField({
  label,
  hint,
  preview,
  fallbackText,
  previewVariant = "avatar",
  imageAlt,
  uploadLabel = "Upload avatar",
  disabled = false,
  readOnly = false,
  isUploading = false,
  onFileSelect,
  onRemove,
  avatarClassName,
  fallbackClassName,
}: AvatarUploadFieldProps) {
  const fileInputId = React.useId();
  const labelId = getFieldLabelId(fileInputId);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const canEdit = !readOnly && !disabled;
  const isBusy = !canEdit || isUploading;

  const openPicker = () => {
    if (!isBusy) inputRef.current?.click();
  };

  const avatarNode =
    previewVariant === "workspace" ? (
      <WorkspaceLogoMark
        logoUrl={preview}
        name={imageAlt ?? fallbackText}
        size="lg"
        className={avatarClassName}
      />
    ) : (
      <Avatar className={cn("h-15 w-15", avatarClassName)}>
        <AvatarImage
          src={preview ?? undefined}
          alt={imageAlt ?? label}
          className="object-cover"
        />
        <AvatarFallback
          className={cn("bg-muted text-muted-foreground text-lg font-medium", fallbackClassName)}
        >
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    );

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await onFileSelect(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Field className="w-full">
      <FieldLabel htmlFor={fileInputId} id={labelId}>
        {label}
      </FieldLabel>
      <div className="flex items-center gap-4">
        {readOnly ? (
          <div className="flex h-15 w-15 items-center justify-center overflow-hidden">
            {avatarNode}
          </div>
        ) : (
          <div
            role="button"
            tabIndex={isBusy ? -1 : 0}
            aria-label={uploadLabel}
            onClick={openPicker}
            onKeyDown={(event) => {
              if (isBusy) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPicker();
              }
            }}
            className={cn(
              "flex h-15 w-15 items-center justify-center overflow-hidden",
              !isBusy && "cursor-pointer hover:opacity-95",
            )}
          >
            {avatarNode}
          </div>
        )}

        {canEdit ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id={fileInputId}
              type="file"
              accept="image/*"
              aria-label={uploadLabel}
              className="hidden"
              onChange={(event) => void handleSelect(event)}
              disabled={isBusy}
            />
            <Button type="button" variant="outline" onClick={openPicker} disabled={isBusy}>
              <UploadCloudIcon />
              {uploadLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void onRemove()}
              disabled={isBusy || !preview}
              className="text-destructive!"
            >
              <TrashIcon />
            </Button>
          </div>
        ) : null}
      </div>
      {hint && canEdit ? <FieldDescription>{hint}</FieldDescription> : null}
    </Field>
  );
}
