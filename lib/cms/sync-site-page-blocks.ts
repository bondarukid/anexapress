import { syncPostBlocks } from "@/lib/cms/sync-post-blocks";
import type { TiptapContent } from "@/types/tiptap";

/**
 * Rebuilds `site_page_blocks` from Tiptap JSON (same algorithm as post_blocks).
 */
export async function syncSitePageBlocks(
  pageId: string,
  versionId: string,
  content: TiptapContent,
): Promise<void> {
  const { createClient } = await import("@/lib/server");
  const { tiptapToBlocksWithTempIds } = await import("@/lib/cms/tiptap-to-blocks");
  const supabase = await createClient();

  await supabase.from("site_page_blocks").delete().eq("version_id", versionId);

  const flat = tiptapToBlocksWithTempIds(pageId, versionId, content);
  if (flat.length === 0) return;

  const tempToReal = new Map<string, string>();

  for (const block of flat) {
    const { tempId, ...row } = block;
    const parentId = row.parentId ? (tempToReal.get(row.parentId) ?? null) : null;

    const { data, error } = await supabase
      .from("site_page_blocks")
      .insert({
        page_id: pageId,
        version_id: versionId,
        parent_id: parentId,
        sort_order: row.sortOrder,
        type: row.type,
        attrs: row.attrs,
        content: row.content,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    tempToReal.set(tempId, data.id);
  }
}

// Re-export for shared block sync naming
export { syncPostBlocks };
