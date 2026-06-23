"use client";

import * as React from "react";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createSiteTextFileAction,
  uploadSiteFileAction,
} from "@/actions/site/site.actions";
import { uploadMediaAction } from "@/actions/media/media.actions";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetAnchor,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { FileManagerUploadProgressDialog } from "./file-manager-upload-progress-dialog";
import {
  createPresetProgressItem,
  createProgressItemsFromFiles,
  type UploadFileProgressItem,
} from "./file-manager-upload-types";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type FileManagerUploadSheetProps = {
  workspaceId: string;
  siteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
};

async function uploadSingleFile(
  workspaceId: string,
  siteId: string,
  file: File,
): Promise<{ success: true } | { success: false; error: string }> {
  if (file.type.startsWith("image/")) {
    const formData = new FormData();
    formData.set("workspaceId", workspaceId);
    formData.set("siteId", siteId);
    formData.set("file", file);

    const result = await uploadMediaAction(formData);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  }

  const formData = new FormData();
  formData.set("workspaceId", workspaceId);
  formData.set("siteId", siteId);
  formData.set("publicPath", `/${file.name}`);
  formData.set("file", file);

  const result = await uploadSiteFileAction(formData);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

/**
 * Bottom sheet with Dropzone for uploading multiple site files and media images.
 */
export function FileManagerUploadSheet({
  workspaceId,
  siteId,
  open,
  onOpenChange,
  onUploaded,
}: FileManagerUploadSheetProps) {
  const [pendingFiles, setPendingFiles] = React.useState<File[]>();
  const [isSheetBusy, setIsSheetBusy] = React.useState(false);
  const [progressOpen, setProgressOpen] = React.useState(false);
  const [progressItems, setProgressItems] = React.useState<UploadFileProgressItem[]>([]);
  const [isUploadActive, setIsUploadActive] = React.useState(false);
  const [hadSuccessfulUpload, setHadSuccessfulUpload] = React.useState(false);

  const resetSheetState = React.useCallback(() => {
    setPendingFiles(undefined);
    setIsSheetBusy(false);
  }, []);

  const resetProgressState = React.useCallback(() => {
    setProgressItems([]);
    setIsUploadActive(false);
    setHadSuccessfulUpload(false);
  }, []);

  const patchProgressItem = React.useCallback(
    (id: string, patch: Partial<UploadFileProgressItem>) => {
      setProgressItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const handleSheetOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (isSheetBusy) return;
      if (!nextOpen) resetSheetState();
      onOpenChange(nextOpen);
    },
    [isSheetBusy, onOpenChange, resetSheetState],
  );

  const handleProgressOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (isUploadActive) return;
      if (!nextOpen) resetProgressState();
      setProgressOpen(nextOpen);
    },
    [isUploadActive, resetProgressState],
  );

  const handleProgressDone = React.useCallback(() => {
    if (hadSuccessfulUpload) {
      onUploaded();
    }
    setProgressOpen(false);
    resetProgressState();
  }, [hadSuccessfulUpload, onUploaded, resetProgressState]);

  const uploadFiles = React.useCallback(
    async (files: File[], items: UploadFileProgressItem[]) => {
      if (files.length === 0) return;

      setIsUploadActive(true);
      setHadSuccessfulUpload(false);

      let uploaded = 0;
      let failed = 0;
      let lastError: string | undefined;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]!;
        const item = items[index];
        if (!item) continue;

        patchProgressItem(item.id, { status: "uploading", error: undefined });

        const result = await uploadSingleFile(workspaceId, siteId, file);
        if (result.success) {
          uploaded += 1;
          setHadSuccessfulUpload(true);
          patchProgressItem(item.id, { status: "success" });
        } else {
          failed += 1;
          lastError = result.error;
          patchProgressItem(item.id, { status: "error", error: result.error });
        }
      }

      setIsUploadActive(false);
      setIsSheetBusy(false);

      if (uploaded === files.length) {
        toast.success(uploaded === 1 ? "File uploaded" : `${uploaded} files uploaded`);
        return;
      }

      if (uploaded > 0) {
        toast.warning(`${uploaded} uploaded, ${failed} failed`);
        return;
      }

      toast.error(lastError ?? "Upload failed");
    },
    [patchProgressItem, siteId, workspaceId],
  );

  const startFileUpload = React.useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      const items = createProgressItemsFromFiles(files);

      setProgressItems(items);
      setProgressOpen(true);
      resetSheetState();
      onOpenChange(false);

      void uploadFiles(files, items);
    },
    [onOpenChange, resetSheetState, uploadFiles],
  );

  function handleDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    setIsSheetBusy(true);
    setPendingFiles(acceptedFiles);
    startFileUpload(acceptedFiles);
  }

  async function handleCreatePreset(publicPath: string, content: string) {
    const presetName = publicPath.replace(/^\//, "");
    const item = createPresetProgressItem(presetName);

    setIsSheetBusy(true);
    setProgressItems([item]);
    setProgressOpen(true);
    resetSheetState();
    onOpenChange(false);
    setIsUploadActive(true);
    setHadSuccessfulUpload(false);

    patchProgressItem(item.id, { status: "uploading" });

    const result = await createSiteTextFileAction({
      workspaceId,
      siteId,
      publicPath,
      content,
    });

    setIsUploadActive(false);
    setIsSheetBusy(false);

    if (!result.success) {
      patchProgressItem(item.id, { status: "error", error: result.error });
      toast.error(result.error);
      return;
    }

    setHadSuccessfulUpload(true);
    patchProgressItem(item.id, { status: "success" });
    toast.success("Text file created");
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetAnchor />
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[85vh] gap-0 rounded-t-xl p-0"
          onInteractOutside={(event) => {
            if (isSheetBusy) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (isSheetBusy) event.preventDefault();
          }}
        >
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle>Upload files</SheetTitle>
            <SheetDescription>
              Drag and drop files here. Images go to the media library; other files are added to
              the site root.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 py-4">
            <Dropzone
              maxFiles={MAX_FILES}
              maxSize={MAX_FILE_SIZE}
              src={pendingFiles}
              disabled={isSheetBusy}
              onError={(err) => toast.error(err.message, { id: "file-manager-dropzone-error" })}
              onDrop={handleDrop}
              className="min-h-44 rounded-xl border-dashed"
            >
              <DropzoneEmptyState>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                    <UploadIcon className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Drag and drop files here</p>
                  <p className="text-muted-foreground text-xs">
                    or click to choose files from your computer
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Up to {MAX_FILES} files, max 50 MB each
                  </p>
                </div>
              </DropzoneEmptyState>
              <DropzoneContent>
                <div className="flex flex-col items-center justify-center gap-3">
                  <p className="text-sm font-medium">Files selected</p>
                  <p className="text-muted-foreground text-xs">
                    Drag and drop or click to replace
                  </p>
                </div>
              </DropzoneContent>
            </Dropzone>
          </div>

          <SheetFooter className="flex-col items-stretch gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSheetBusy}
                onClick={() =>
                  void handleCreatePreset("/robots.txt", "User-agent: *\nAllow: /\n")
                }
              >
                robots.txt preset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSheetBusy}
                onClick={() =>
                  void handleCreatePreset(
                    "/app-ads.txt",
                    "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
                  )
                }
              >
                app-ads.txt preset
              </Button>
            </div>
            <SheetClose asChild>
              <Button type="button" variant="secondary" disabled={isSheetBusy}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {progressOpen ? (
        <FileManagerUploadProgressDialog
          open={progressOpen}
          items={progressItems}
          isActive={isUploadActive}
          onOpenChange={handleProgressOpenChange}
          onDone={handleProgressDone}
        />
      ) : null}
    </>
  );
}
