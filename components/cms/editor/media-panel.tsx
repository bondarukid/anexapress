"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { listMediaAction, uploadMediaAction } from "@/actions/media/media.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaFile } from "@/types/media";

type MediaPanelProps = {
  workspaceId: string;
  siteId?: string | null;
  onInsertImage: (media: MediaFile) => void;
};

export function MediaPanel({ workspaceId, siteId, onInsertImage }: MediaPanelProps) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadMedia = useCallback(() => {
    startTransition(async () => {
      const result = await listMediaAction({
        workspaceId,
        search: search || undefined,
        siteId: siteId ?? undefined,
      });
      if (result.success) {
        setItems(result.data.items);
      }
    });
  }, [search, siteId, workspaceId]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      startTransition(async () => {
        const formData = new FormData();
        formData.set("workspaceId", workspaceId);
        formData.set("file", file);
        if (siteId) formData.set("siteId", siteId);

        const result = await uploadMediaAction(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("Uploaded");
        setItems((prev) => [result.data.media, ...prev]);
      });
    },
    [siteId, workspaceId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search media…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div
        {...getRootProps()}
        className="border-border flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center"
      >
        <input {...getInputProps()} />
        <p className="text-muted-foreground text-xs">
          {isDragActive ? "Drop image here" : "Upload image"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="border-border relative aspect-square overflow-hidden rounded-md border"
            onClick={() => onInsertImage(item)}
          >
            <Image
              src={item.publicUrl}
              alt={item.alt ?? item.filename}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={loadMedia} disabled={isPending}>
        Refresh
      </Button>
    </div>
  );
}
