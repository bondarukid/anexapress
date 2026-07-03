"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import {
  createPostSchema,
  saveDraftSchema,
  publishPostSchema,
  createSnapshotSchema,
  revertVersionSchema,
  deletePostSchema,
} from "@/schemas/post.schema";
import {
  createPost,
  saveDraft,
  publishPost,
  createSnapshot,
  revertToVersion,
  deletePost,
} from "@/services/post.service";
import type { PostActionResult, PostStatus, RevertedDraftData } from "@/types/post";

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createPostAction(
  input: unknown,
): Promise<PostActionResult<{ postId: string }>> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  return createPost(userId, parsed.data);
}

export async function saveDraftAction(
  input: unknown,
): Promise<
  PostActionResult<{
    savedAt: string;
    status: PostStatus;
    slug: string;
    hasUnpublishedChanges: boolean;
  }>
> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  const result = await saveDraft(userId, parsed.data);
  if (result.success && parsed.data.display && !result.data.hasUnpublishedChanges) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function publishPostAction(input: unknown): Promise<PostActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = publishPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  const result = await publishPost(userId, parsed.data.workspaceId, parsed.data.postId);
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function createSnapshotAction(
  input: unknown,
): Promise<PostActionResult<{ versionId: string }>> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = createSnapshotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  return createSnapshot(userId, parsed.data.workspaceId, parsed.data.postId);
}

export async function revertVersionAction(
  input: unknown,
): Promise<PostActionResult<RevertedDraftData>> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = revertVersionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  return revertToVersion(
    userId,
    parsed.data.workspaceId,
    parsed.data.postId,
    parsed.data.versionId,
  );
}

export async function deletePostAction(input: unknown): Promise<PostActionResult> {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: "Session expired. Please sign in again." };
  }

  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "validation",
    };
  }

  const result = await deletePost(userId, parsed.data.workspaceId, parsed.data.postId);
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}
