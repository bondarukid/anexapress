"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST_STATUSES, POST_STATUS_META } from "@/lib/cms/post-status";
import type { PostStatus } from "@/types/post";

type PostStatusSelectorProps = {
  value: PostStatus;
  onChange: (status: PostStatus) => void;
  canPublish?: boolean;
  /** Post was published at least once — draft is a version state, not post status. */
  hasPublishedVersion?: boolean;
};

/**
 * Post status picker as a combobox-style select.
 * Published is only set via the editor Publish button — not from this control.
 */
export function PostStatusSelector({
  value,
  onChange,
  canPublish = true,
  hasPublishedVersion = false,
}: PostStatusSelectorProps) {
  const selectedMeta = POST_STATUS_META[value];
  const selectableStatuses = hasPublishedVersion
    ? POST_STATUSES.filter((status) => status !== "draft")
    : value === "published"
      ? POST_STATUSES
      : POST_STATUSES.filter((status) => status !== "published");

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="post-status-select">Status</Label>
        <p className="text-muted-foreground text-xs">
          Controls visibility on the public site and how the post appears in lists.
        </p>
      </div>

      <Select value={value} onValueChange={(next) => onChange(next as PostStatus)}>
        <SelectTrigger id="post-status-select" className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {selectableStatuses.map((status) => {
            const meta = POST_STATUS_META[status];
            const Icon = meta.icon;

            return (
              <SelectItem key={status} value={status}>
                <span className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  {meta.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <p className="text-muted-foreground text-xs leading-relaxed">{selectedMeta.description}</p>

      {value !== "published" ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          To publish on the site, use the <strong>Publish</strong> button in the editor header.
        </p>
      ) : null}

      {hasPublishedVersion ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          Edits are saved to a draft version. The live post updates only when you press{" "}
          <strong>Publish</strong>.
        </p>
      ) : null}

      {!canPublish && value !== "published" ? (
        <p className="text-muted-foreground text-xs">
          You need publish permission to publish this post.
        </p>
      ) : null}
    </div>
  );
}
