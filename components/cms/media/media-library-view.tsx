"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

import { deleteMediaAction, listMediaAction, uploadMediaAction } from "@/actions/media/media.actions";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MediaFile } from "@/types/media";
import type { SiteSummary } from "@/types/site";

type MediaLibraryViewProps = {
  workspaceId: string;
  sites: SiteSummary[];
  initialSiteId?: string | null;
};

export function MediaLibraryView({ workspaceId, sites, initialSiteId }: MediaLibraryViewProps) {
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [items, setItems] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<string>(initialSiteId ?? "all");
  const [isPending, startTransition] = useTransition();

  const loadMedia = useCallback(() => {
    startTransition(async () => {
      const result = await listMediaAction({
        workspaceId,
        search: search || undefined,
        siteId: siteFilter === "all" ? undefined : siteFilter === "shared" ? null : siteFilter,
      });
      if (result.success) setItems(result.data.items);
    });
  }, [search, siteFilter, workspaceId]);

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
        if (siteFilter !== "all" && siteFilter !== "shared") {
          formData.set("siteId", siteFilter);
        }

        const result = await uploadMediaAction(formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Uploaded");
        setItems((prev) => [result.data.media, ...prev]);
      });
    },
    [siteFilter, workspaceId],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const handleSiteFilterChange = (value: string) => {
    setSiteFilter(value);
    if (activeWorkspace) {
      const query = value === "all" ? "" : `?site=${value}`;
      router.push(workspacePathFromSummary(activeWorkspace, `/media${query}`));
    }
  };

  const handleDelete = (mediaId: string) => {
    startTransition(async () => {
      const result = await deleteMediaAction({ workspaceId, mediaId });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Deleted");
        setItems((prev) => prev.filter((m) => m.id !== mediaId));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Media library</h1>
          <p className="text-muted-foreground text-sm">Workspace images for the block editor.</p>
        </div>
        <div className="flex items-end gap-3">
          {sites.length > 0 ? (
            <div className="space-y-1">
              <Label className="text-xs">Scope</Label>
              <Select value={siteFilter} onValueChange={handleSiteFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All media</SelectItem>
                  <SelectItem value="shared">Workspace shared</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search by filename or alt…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div
        {...getRootProps()}
        className="border-border flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8"
      >
        <input {...getInputProps()} />
        <Upload className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm">
          {isDragActive ? "Drop to upload" : "Drag & drop or click to upload"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="border-border group relative overflow-hidden rounded-lg border">
            <div className="bg-muted relative aspect-square">
              <Image src={item.publicUrl} alt={item.alt ?? item.filename} fill className="object-cover" />
            </div>
            <div className="p-2 text-xs">
              <p className="truncate font-medium">{item.filename}</p>
              {item.siteId ? (
                <p className="text-muted-foreground truncate">Site scoped</p>
              ) : (
                <p className="text-muted-foreground">Shared</p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 size-7 opacity-0 transition group-hover:opacity-100"
              disabled={isPending}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
