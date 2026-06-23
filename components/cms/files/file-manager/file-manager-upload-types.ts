"use client";

export type UploadFileStatus = "pending" | "uploading" | "success" | "error";

export type UploadFileProgressItem = {
  id: string;
  name: string;
  size: number;
  status: UploadFileStatus;
  error?: string;
};

export function createProgressItemsFromFiles(files: File[]): UploadFileProgressItem[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    status: "pending" as const,
  }));
}

export function createPresetProgressItem(name: string): UploadFileProgressItem {
  return {
    id: crypto.randomUUID(),
    name,
    size: 0,
    status: "pending",
  };
}
