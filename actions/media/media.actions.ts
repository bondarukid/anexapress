"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/server";
import { deleteMedia, listMediaFiles, uploadMedia } from "@/services/media.service";
import type { MediaActionResult, MediaFile } from "@/types/media";

const listMediaSchema = z.object({
  workspaceId: z.string().uuid(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  siteId: z.union([z.string().uuid(), z.null()]).optional(),
});

const uploadMediaSchema = z.object({
  workspaceId: z.string().uuid(),
  siteId: z.string().uuid().optional(),
  alt: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
});

const deleteMediaSchema = z.object({
  workspaceId: z.string().uuid(),
  mediaId: z.string().uuid(),
});

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function listMediaAction(
  input: unknown,
): Promise<MediaActionResult<{ items: MediaFile[] }> | { success: true; data: { items: MediaFile[] } }> {
  const parsed = listMediaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const items = await listMediaFiles(parsed.data.workspaceId, {
      search: parsed.data.search,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      siteId: parsed.data.siteId,
    });
    return { success: true, data: { items } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load media.",
    };
  }
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<MediaActionResult<{ media: MediaFile }>> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const raw = {
    workspaceId: String(formData.get("workspaceId") ?? ""),
    siteId: formData.get("siteId") ? String(formData.get("siteId")) : undefined,
    alt: formData.get("alt") ? String(formData.get("alt")) : undefined,
    title: formData.get("title") ? String(formData.get("title")) : undefined,
  };

  const parsed = uploadMediaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  const result = await uploadMedia(userId, parsed.data.workspaceId, file, {
    alt: parsed.data.alt,
    title: parsed.data.title,
    siteId: parsed.data.siteId ?? null,
  });

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}

export async function deleteMediaAction(input: unknown): Promise<MediaActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = deleteMediaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  return deleteMedia(userId, parsed.data.workspaceId, parsed.data.mediaId);
}
