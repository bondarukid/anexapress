"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { deleteSiteFileAction } from "@/actions/site/site.actions";
import { deleteMediaAction } from "@/actions/media/media.actions";
import { Button } from "@/components/ui/button";
import type {
  FileManagerCategory,
  SiteFileManagerData,
  SiteFileManagerItem,
} from "@/types/site-file-manager";

import { FileManagerCategoryCard } from "./file-manager/file-manager-category-card";
import {
  FileManagerFolderCard,
  formatFolderLastUpdate,
} from "./file-manager/file-manager-folder-card";
import { FileManagerRecentTable } from "./file-manager/file-manager-recent-table";
import { FileManagerStorageCard } from "./file-manager/file-manager-storage-card";
import { FileManagerTransferChart } from "./file-manager/file-manager-transfer-chart";

const FileManagerUploadSheet = dynamic(
  () =>
    import("./file-manager/file-manager-upload-sheet").then(
      (mod) => mod.FileManagerUploadSheet,
    ),
  { ssr: false },
);

type SiteFileManagerDashboardProps = {
  workspaceId: string;
  siteId: string;
  siteName: string;
  primaryDomain?: string | null;
  data: SiteFileManagerData;
};

type FilterKey = "all" | FileManagerCategory | "site-root";

const FOLDER_SHORTCUTS: { key: FilterKey; label: string }[] = [
  { key: "documents", label: "Documents" },
  { key: "images", label: "Images" },
];

function matchesFilter(item: SiteFileManagerItem, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "site-root") return item.kind === "site-root";
  return item.category === filter;
}

export function SiteFileManagerDashboard({
  workspaceId,
  siteId,
  data,
}: SiteFileManagerDashboardProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({
    documents: true,
    images: false,
  });
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(
    () => data.items.filter((item) => matchesFilter(item, filter)),
    [data.items, filter],
  );

  const recentRows = useMemo(() => {
    const source = filter === "all" ? data.recentItems : filteredItems;
    return source.slice(0, 5);
  }, [data.recentItems, filter, filteredItems]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDelete = useCallback(
    (item: SiteFileManagerItem) => {
      startTransition(async () => {
        const result =
          item.kind === "media"
            ? await deleteMediaAction({ workspaceId, mediaId: item.id })
            : await deleteSiteFileAction({ workspaceId, siteId, fileId: item.id });

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("File deleted");
        refresh();
      });
    },
    [refresh, siteId, workspaceId],
  );

  const getFolderCount = useCallback(
    (key: FilterKey) => {
      if (key === "site-root") {
        return data.items.filter((item) => item.kind === "site-root").length;
      }
      return data.items.filter((item) => item.category === key).length;
    },
    [data.items],
  );

  const getFolderLastItem = useCallback(
    (key: FilterKey) => {
      if (key === "site-root") {
        return data.items.find((item) => item.kind === "site-root");
      }
      return data.items.find((item) => item.category === key);
    },
    [data.items],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">File Manager</h1>
        <Button disabled={isPending} onClick={() => setUploadOpen(true)}>
          <Upload data-icon="inline-start" />
          Upload
        </Button>
      </header>

      <FileManagerUploadSheet
        workspaceId={workspaceId}
        siteId={siteId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={refresh}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.categories.map((stat) => (
          <FileManagerCategoryCard
            key={stat.category}
            stat={stat}
            storageCapBytes={data.storageCapBytes}
            onViewMore={setFilter}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FOLDER_SHORTCUTS.map((folder) => {
          const lastItem = getFolderLastItem(folder.key);
          return (
            <FileManagerFolderCard
              key={folder.key}
              label={folder.label}
              itemCount={getFolderCount(folder.key)}
              lastUpdate={formatFolderLastUpdate(lastItem?.createdAt)}
              isStarred={Boolean(starred[folder.key])}
              onSelect={() => setFilter(folder.key)}
              onToggleStar={() =>
                setStarred((prev) => ({ ...prev, [folder.key]: !prev[folder.key] }))
              }
            />
          );
        })}
        <div className="sm:col-span-2 xl:col-span-2">
          <FileManagerStorageCard
            totalBytes={data.totalBytes}
            storageCapBytes={data.storageCapBytes}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <FileManagerTransferChart
            monthlyTransfers={data.monthlyTransfers}
            dateRangeLabel={data.dateRangeLabel}
          />
        </div>
        <div className="xl:col-span-2">
          <FileManagerRecentTable
            items={recentRows}
            isPending={isPending}
            onViewAll={() => setFilter("all")}
            onDelete={handleDelete}
          />
        </div>
      </section>
    </div>
  );
}
