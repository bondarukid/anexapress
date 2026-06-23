import { listMediaFiles } from "@/services/media.service";
import { listSiteFiles } from "@/services/site-file.service";
import type {
  FileManagerCategory,
  FileManagerCategoryStats,
  FileManagerMonthlyTransfer,
  SiteFileManagerData,
  SiteFileManagerItem,
} from "@/types/site-file-manager";

const STORAGE_SOFT_CAP_BYTES = 3 * 1024 * 1024 * 1024;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const CATEGORY_ORDER: FileManagerCategory[] = ["documents", "images", "videos", "others"];

/** Classifies mime type into file manager category buckets. */
export function classifyFileManagerMime(mime: string): FileManagerCategory {
  const normalized = mime.toLowerCase();
  if (normalized.startsWith("image/")) return "images";
  if (normalized.startsWith("video/")) return "videos";
  if (
    normalized.startsWith("text/") ||
    normalized.includes("pdf") ||
    normalized.includes("document") ||
    normalized.includes("word") ||
    normalized.includes("sheet") ||
    normalized.includes("json") ||
    normalized.includes("xml")
  ) {
    return "documents";
  }
  return "others";
}

function buildCategoryStats(items: SiteFileManagerItem[]): FileManagerCategoryStats[] {
  const map = new Map<FileManagerCategory, FileManagerCategoryStats>();
  for (const category of CATEGORY_ORDER) {
    map.set(category, { category, count: 0, bytes: 0 });
  }

  for (const item of items) {
    const stat = map.get(item.category)!;
    stat.count += 1;
    stat.bytes += item.size;
  }

  return CATEGORY_ORDER.map((category) => map.get(category)!);
}

function buildMonthlyTransferChart(items: SiteFileManagerItem[]): FileManagerMonthlyTransfer[] {
  const year = new Date().getFullYear();
  const buckets = MONTH_LABELS.map((month) => ({
    month,
    documents: 0,
    images: 0,
    videos: 0,
    others: 0,
  }));

  for (const item of items) {
    const created = new Date(item.createdAt);
    if (created.getFullYear() !== year) continue;

    const bucket = buckets[created.getMonth()];
    if (!bucket) continue;

    bucket[item.category] += 1;
  }

  return buckets;
}

function buildDateRangeLabel(): string {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 27);

  const formatPart = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return `${formatPart(start)} – ${formatPart(end)}`;
}

/**
 * Aggregates media library + site root files for the site file manager dashboard.
 */
export async function buildSiteFileManagerData(
  workspaceId: string,
  siteId: string,
): Promise<SiteFileManagerData> {
  const [media, siteFiles] = await Promise.all([
    listMediaFiles(workspaceId, { siteId, limit: 500 }),
    listSiteFiles(siteId),
  ]);

  const items: SiteFileManagerItem[] = [
    ...media.map((entry) => ({
      id: entry.id,
      kind: "media" as const,
      name: entry.filename,
      mimeType: entry.mimeType,
      size: entry.size,
      createdAt: entry.createdAt,
      previewUrl: entry.publicUrl,
      category: classifyFileManagerMime(entry.mimeType),
    })),
    ...siteFiles.map((entry) => ({
      id: entry.id,
      kind: "site-root" as const,
      name: entry.filename || entry.publicPath,
      mimeType: entry.mimeType,
      size: entry.size,
      createdAt: entry.createdAt,
      previewUrl: null,
      publicPath: entry.publicPath,
      category: classifyFileManagerMime(entry.mimeType),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalBytes = items.reduce((sum, item) => sum + item.size, 0);
  const storageCapBytes = Math.max(STORAGE_SOFT_CAP_BYTES, totalBytes);

  return {
    items,
    categories: buildCategoryStats(items),
    totalBytes,
    storageCapBytes,
    monthlyTransfers: buildMonthlyTransferChart(items),
    dateRangeLabel: buildDateRangeLabel(),
    recentItems: items.slice(0, 5),
  };
}
