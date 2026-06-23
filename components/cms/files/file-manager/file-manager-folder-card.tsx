"use client";

import { formatDistanceToNow } from "date-fns";
import { Folder, MoreVertical, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FileManagerFolderCardProps = {
  label: string;
  itemCount: number;
  lastUpdate: string;
  isStarred: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
};

/**
 * Folder shortcut card with item count, last update, and star toggle.
 */
export function FileManagerFolderCard({
  label,
  itemCount,
  lastUpdate,
  isStarred,
  onSelect,
  onToggleStar,
}: FileManagerFolderCardProps) {
  return (
    <Card
      className="cursor-pointer p-6 transition-colors hover:bg-accent/30"
      onClick={onSelect}
    >
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Folder className="size-5 fill-amber-400/20 text-amber-400" />
            <span className="font-medium">{label}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Folder actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect();
                }}
              >
                Open folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleStar();
                }}
              >
                {isStarred ? "Remove star" : "Add star"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm font-medium">{itemCount} items</p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">Last update: {lastUpdate}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(event) => {
              event.stopPropagation();
              onToggleStar();
            }}
          >
            <Star
              className={cn(
                "size-4",
                isStarred
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground",
              )}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatFolderLastUpdate(createdAt: string | undefined): string {
  if (!createdAt) return "No uploads yet";
  return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
}
