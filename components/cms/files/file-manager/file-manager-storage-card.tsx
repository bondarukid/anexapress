"use client";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { categoryPercent, formatStorageGbLabel } from "./file-manager-utils";

type FileManagerStorageCardProps = {
  totalBytes: number;
  storageCapBytes: number;
};

/**
 * Storage usage card with thick progress bar and used/total labels.
 */
export function FileManagerStorageCard({
  totalBytes,
  storageCapBytes,
}: FileManagerStorageCardProps) {
  const storagePercent = categoryPercent(totalBytes, storageCapBytes);

  return (
    <Card className="h-full p-6">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">Storage Space Used</p>
            <p className="text-muted-foreground text-sm">See your remaining file storage</p>
          </div>
          <Button variant="outline" size="icon-sm" className="shrink-0">
            <ChevronRight className="size-4" />
            <span className="sr-only">View storage details</span>
          </Button>
        </div>

        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {formatStorageGbLabel(totalBytes, "used")}
          </span>
          <span className="text-muted-foreground">
            {formatStorageGbLabel(storageCapBytes, "total")}
          </span>
        </div>

        <Progress
          value={storagePercent}
          className="h-3 [&_[data-slot=progress-indicator]]:bg-foreground"
        />
      </CardContent>
    </Card>
  );
}
