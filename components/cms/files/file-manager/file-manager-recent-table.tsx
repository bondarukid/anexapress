"use client";

import { format } from "date-fns";
import { ChevronRight, FileIcon, FileText, ImageIcon, MoreHorizontal, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize } from "@/lib/help/support-ticket";
import type { SiteFileManagerItem } from "@/types/site-file-manager";

type FileManagerRecentTableProps = {
  items: SiteFileManagerItem[];
  isPending: boolean;
  onViewAll: () => void;
  onDelete: (item: SiteFileManagerItem) => void;
};

function fileIconForMime(mimeType: string) {
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith("image/")) return ImageIcon;
  if (normalized.startsWith("video/")) return VideoIcon;
  if (
    normalized.startsWith("text/") ||
    normalized.includes("pdf") ||
    normalized.includes("document")
  ) {
    return FileText;
  }
  return FileIcon;
}

/**
 * Recently uploaded files table with mime-based icons and row actions.
 */
export function FileManagerRecentTable({
  items,
  isPending,
  onViewAll,
  onDelete,
}: FileManagerRecentTableProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Recently Uploaded Files</CardTitle>
        <Button variant="link" className="h-auto gap-0.5 p-0" onClick={onViewAll}>
          View All
          <ChevronRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                  No files yet. Use Upload or drag files here.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const Icon = fileIconForMime(item.mimeType);
                return (
                  <TableRow key={`${item.kind}-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                          <Icon className="text-muted-foreground size-4" />
                        </div>
                        <p className="truncate font-medium">{item.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(item.size)}</TableCell>
                    <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={isPending}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.previewUrl ? (
                            <DropdownMenuItem asChild>
                              <a
                                href={item.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open
                              </a>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(item)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
