import type { LucideIcon } from "lucide-react";
import { Archive, CircleDot, Globe } from "lucide-react";

import type { PostStatus } from "@/types/post";

export type PostStatusMeta = {
  value: PostStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeVariant: "default" | "secondary" | "outline";
  accentClass: string;
};

export const POST_STATUSES: PostStatus[] = ["draft", "published", "archived"];

export const POST_STATUS_META: Record<PostStatus, PostStatusMeta> = {
  draft: {
    value: "draft",
    label: "Draft",
    description: "Visible only in the editor. Not shown on the public site.",
    icon: CircleDot,
    badgeVariant: "secondary",
    accentClass: "border-amber-500/30 bg-amber-500/5 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500/10",
  },
  published: {
    value: "published",
    label: "Published",
    description: "Live on the site. Readers can open this post from the blog.",
    icon: Globe,
    badgeVariant: "default",
    accentClass: "border-emerald-500/30 bg-emerald-500/5 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500/10",
  },
  archived: {
    value: "archived",
    label: "Archived",
    description: "Hidden from the site and default lists. Kept for records.",
    icon: Archive,
    badgeVariant: "outline",
    accentClass: "border-slate-500/30 bg-slate-500/5 data-[state=checked]:border-slate-500 data-[state=checked]:bg-slate-500/10",
  },
};

export function getPostStatusMeta(status: PostStatus): PostStatusMeta {
  return POST_STATUS_META[status];
}

export function getPostStatusLabel(status: PostStatus): string {
  return POST_STATUS_META[status].label;
}
