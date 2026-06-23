"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";

import { listMediaAction } from "@/actions/media/media.actions";
import { Button } from "@/components/ui/button";
import type { MediaFile } from "@/types/media";
import { cn } from "@/lib/utils";

type MediaPickerProps = {
  workspaceId: string;
  selectedId: string | null;
  onSelect: (media: MediaFile | null) => void;
};

export function MediaPicker({ workspaceId, selectedId, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await listMediaAction({ workspaceId, limit: 12 });
      if (result.success) {
        setItems(result.data.items);
      }
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <Image
            src={selected.publicUrl}
            alt={selected.alt ?? selected.filename}
            fill
            className="object-cover"
            sizes="300px"
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No OG image selected.</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "border-border relative aspect-square overflow-hidden rounded-md border",
              selectedId === item.id && "ring-primary ring-2",
            )}
            onClick={() => onSelect(item)}
          >
            <Image
              src={item.publicUrl}
              alt={item.alt ?? item.filename}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={isPending}>
          Refresh
        </Button>
        {selectedId ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
