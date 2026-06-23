"use client";

import * as React from "react";
import imageCompression from "browser-image-compression";
import { ImageIcon, TrashIcon } from "lucide-react";

import { removeAvatarAction, uploadAvatarAction } from "@/actions/user/avatar";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/dropzone";
import { toast } from "@/components/toasts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const AVATAR_ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
} as const;

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.9,
  alwaysKeepResolution: true,
  useWebWorker: true,
  initialQuality: 0.95,
} as const;

export type ProfileAvatarUploadSheetProps = {
  initialAvatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  avatarClassName?: string;
  onAvatarChange?: (url: string | null) => void;
};

function getInitials(firstName?: string, lastName?: string) {
  const first = (firstName ?? "").trim().charAt(0).toUpperCase();
  const last = (lastName ?? "").trim().charAt(0).toUpperCase();
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return "U";
}

/**
 * Clickable profile avatar that opens a bottom sheet with Dropzone upload/remove.
 * Uses radix-ui Sheet (same dialog stack as onboarding) so the sheet layers above parent modals.
 */
export function ProfileAvatarUploadSheet({
  initialAvatarUrl = null,
  firstName,
  lastName,
  avatarClassName = "size-20",
  onAvatarChange,
}: ProfileAvatarUploadSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(initialAvatarUrl ?? null);
  const [pendingFiles, setPendingFiles] = React.useState<File[]>();
  const [isUploading, setIsUploading] = React.useState(false);

  const initials = getInitials(firstName, lastName);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", { id: "avatar-upload-error" });
      return;
    }

    setIsUploading(true);
    setPendingFiles([file]);

    try {
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      const avatarFormData = new FormData();
      avatarFormData.append("avatarFile", compressedFile, file.name);

      const uploadPromise = async () => {
        const res = await uploadAvatarAction(avatarFormData);
        if (!res.success || !res.avatarUrl) {
          throw new Error(res.error || "Upload failed");
        }
        return res;
      };

      await toast.promise.track(uploadPromise(), {
        loading: "Uploading photo...",
        success: (data) => {
          setPreview(data.avatarUrl);
          onAvatarChange?.(data.avatarUrl);
          setPendingFiles(undefined);
          setOpen(false);
          setIsUploading(false);
          return "Photo updated successfully!";
        },
        error: (err) => {
          setPendingFiles(undefined);
          setIsUploading(false);
          return err instanceof Error ? err.message : "Upload failed";
        },
      });
    } catch (err) {
      setPendingFiles(undefined);
      setIsUploading(false);
      toast.error(err instanceof Error ? err.message : "Error compressing image", {
        id: "avatar-upload-error",
      });
    }
  }

  async function handleRemove() {
    setIsUploading(true);

    const deletePromise = async () => {
      const res = await removeAvatarAction();
      if (!res.success) throw new Error(res.error || "Delete failed");
      return res;
    };

    await toast.promise.track(deletePromise(), {
      loading: "Removing photo...",
      success: () => {
        setPreview(null);
        onAvatarChange?.(null);
        setPendingFiles(undefined);
        setIsUploading(false);
        return "Photo removed!";
      },
      error: (err) => {
        setIsUploading(false);
        return err instanceof Error ? err.message : "Delete failed";
      },
    });
  }

  function handleDrop(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;
    void uploadFile(file);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Change profile photo"
        aria-expanded={open}
        disabled={isUploading}
        onClick={() => setOpen(true)}
        className={cn(
          "relative shrink-0 rounded-full outline-none transition-opacity",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
          !isUploading && "cursor-pointer hover:opacity-95",
          isUploading && "cursor-not-allowed opacity-70",
        )}
      >
        <Avatar className={avatarClassName}>
          <AvatarImage src={preview ?? undefined} alt="Profile photo" className="object-cover" />
          <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
        <SheetContent
          side="bottom"
          showCloseButton={false}
          overlayClassName="!z-[100]"
          className="!z-[100] max-h-[85vh] gap-0 rounded-t-xl p-0"
          onInteractOutside={(event) => {
            if (isUploading) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isUploading) event.preventDefault();
          }}
        >
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle>Profile photo</SheetTitle>
            <SheetDescription>
              Upload JPG, PNG, or WebP. Images are compressed to about 1 MB before upload.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 py-4">
            <Dropzone
              accept={AVATAR_ACCEPT}
              maxFiles={1}
              maxSize={AVATAR_MAX_SIZE}
              src={pendingFiles}
              disabled={isUploading}
              onError={(err) => toast.error(err.message, { id: "avatar-dropzone-error" })}
              onDrop={handleDrop}
              className="min-h-44 rounded-xl border-dashed"
            >
              <DropzoneEmptyState>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                    <ImageIcon className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Drag and drop your photo here</p>
                  <p className="text-muted-foreground text-xs">
                    or click to choose a file from your computer
                  </p>
                </div>
              </DropzoneEmptyState>
              <DropzoneContent>
                <div className="flex flex-col items-center justify-center gap-3">
                  <p className="text-sm font-medium">{pendingFiles?.[0]?.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {isUploading ? "Uploading..." : "Drag and drop or click to replace"}
                  </p>
                </div>
              </DropzoneContent>
            </Dropzone>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t p-4">
            {preview ? (
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => void handleRemove()}
              >
                <TrashIcon className="size-4" />
                Remove photo
              </Button>
            ) : null}
            <SheetClose asChild>
              <Button type="button" variant="secondary" disabled={isUploading}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
