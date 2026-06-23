"use client";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import type { PostVersionSummary } from "@/types/post";

type VersionsPanelProps = {
  versions: PostVersionSummary[];
  onRevert: (versionId: string) => void;
};

export function VersionsPanel({ versions, onRevert }: VersionsPanelProps) {
  if (versions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No saved versions yet. Use &quot;Save version&quot; in the toolbar to create a snapshot.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {versions.map((version) => (
        <li
          key={version.id}
          className="border-border flex items-center justify-between gap-2 rounded-md border p-3"
        >
          <div>
            <p className="text-sm font-medium">
              {version.kind === "published" ? "Published" : "Snapshot"} v{version.version}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
            </p>
          </div>
          {version.kind !== "published" ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onRevert(version.id)}>
              Restore
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => onRevert(version.id)}>
              Restore to draft
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
