import type { FileManagerCategory } from "@/types/site-file-manager";

export const CATEGORY_META: Record<
  FileManagerCategory,
  {
    label: string;
    progressClass: string;
    iconClass: string;
    chartBarColor: string;
  }
> = {
  documents: {
    label: "Documents",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-blue-500",
    iconClass: "text-blue-500",
    chartBarColor: "rgb(59, 130, 246)",
  },
  images: {
    label: "Images",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-green-500",
    iconClass: "text-green-500",
    chartBarColor: "rgb(34, 197, 94)",
  },
  videos: {
    label: "Videos",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-red-500",
    iconClass: "text-red-500",
    chartBarColor: "rgb(239, 68, 68)",
  },
  others: {
    label: "Others",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-amber-500",
    iconClass: "text-amber-500",
    chartBarColor: "rgb(245, 158, 11)",
  },
};

export const CHART_CATEGORY_ORDER: FileManagerCategory[] = [
  "documents",
  "images",
  "videos",
  "others",
];

export function formatStorageGb(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 0.1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function formatStorageGbLabel(bytes: number, suffix: "used" | "total"): string {
  return `${formatStorageGb(bytes)} ${suffix}`;
}

export function categoryPercent(bytes: number, capBytes: number): number {
  if (capBytes <= 0) return 0;
  return Math.min(100, Math.round((bytes / capBytes) * 100));
}
