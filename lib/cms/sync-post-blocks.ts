import { createClient } from "@/lib/server";
import { tiptapToBlocksWithTempIds } from "@/lib/cms/tiptap-to-blocks";
import type { TiptapContent } from "@/types/tiptap";

/**
 * Rebuilds `post_blocks` for a version from Tiptap JSON.
 * Deletes existing rows first to avoid drift.
 */
export async function syncPostBlocks(
  postId: string,
  versionId: string,
  content: TiptapContent,
): Promise<void> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("post_blocks")
    .delete()
    .eq("version_id", versionId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const flat = tiptapToBlocksWithTempIds(postId, versionId, content);
  if (flat.length === 0) return;

  const tempToReal = new Map<string, string>();

  for (const block of flat) {
    const { tempId, ...row } = block;
    const parentId = row.parentId ? (tempToReal.get(row.parentId) ?? null) : null;

    const { data, error } = await supabase
      .from("post_blocks")
      .insert({
        post_id: row.postId,
        version_id: row.versionId,
        parent_id: parentId,
        sort_order: row.sortOrder,
        type: row.type,
        attrs: row.attrs,
        content: row.content,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    tempToReal.set(tempId, data.id);
  }
}
