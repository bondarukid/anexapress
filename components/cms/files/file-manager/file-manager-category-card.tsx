"use client";

import { ChevronRight, FileIcon, FileText, ImageIcon, VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FileManagerCategory, FileManagerCategoryStats } from "@/types/site-file-manager";

import {
  CATEGORY_META,
  categoryPercent,
  formatStorageGbLabel,
} from "./file-manager-utils";

const CATEGORY_ICONS = {
  documents: FileText,
  images: ImageIcon,
  videos: VideoIcon,
  others: FileIcon,
} as const;

type FileManagerCategoryCardProps = {
  stat: FileManagerCategoryStats;
  storageCapBytes: number;
  onViewMore: (category: FileManagerCategory) => void;
};

/**
 * Category summary card with large count, colored progress, and view-more action.
 */
export function FileManagerCategoryCard({
  stat,
  storageCapBytes,
  onViewMore,
}: FileManagerCategoryCardProps) {
  const meta = CATEGORY_META[stat.category];
  const Icon = CATEGORY_ICONS[stat.category];
  const percent = categoryPercent(stat.bytes, storageCapBytes);

  return (
    <Card className="p-6">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{meta.label}</p>
          <Icon className={cn("size-9 shrink-0", meta.iconClass)} strokeWidth={1.5} />
        </div>

        <p className="text-4xl font-bold tracking-tight">{stat.count}</p>

        <Progress value={percent} className={cn("h-1.5 w-full", meta.progressClass)} />

        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {formatStorageGbLabel(stat.bytes, "used")}
          </span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>

        <div className="flex justify-end">
          <Button
            variant="link"
            className="h-auto gap-0.5 p-0 text-sm"
            onClick={() => onViewMore(stat.category)}
          >
            View more
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
