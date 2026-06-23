export type FileManagerCategory = "documents" | "images" | "videos" | "others";

export type SiteFileManagerItem = {
  id: string;
  kind: "media" | "site-root";
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  previewUrl: string | null;
  publicPath?: string;
  category: FileManagerCategory;
};

export type FileManagerCategoryStats = {
  category: FileManagerCategory;
  count: number;
  bytes: number;
};

export type FileManagerMonthlyTransfer = {
  month: string;
  documents: number;
  images: number;
  videos: number;
  others: number;
};

export type SiteFileManagerData = {
  items: SiteFileManagerItem[];
  categories: FileManagerCategoryStats[];
  totalBytes: number;
  storageCapBytes: number;
  monthlyTransfers: FileManagerMonthlyTransfer[];
  dateRangeLabel: string;
  recentItems: SiteFileManagerItem[];
};
