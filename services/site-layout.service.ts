import { createClient } from "@/lib/server";
import { mapSiteLayoutRow } from "@/lib/cms/site-mappers";
import { PERM_CONTENT_CREATE } from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type { UpdateSiteLayoutInput } from "@/schemas/site-layout.schema";
import type { SiteActionResult, SiteLayout } from "@/types/site";

export async function getSiteLayout(siteId: string): Promise<SiteLayout | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_layouts")
    .select("*")
    .eq("site_id", siteId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSiteLayoutRow(data);
}

export async function updateSiteLayout(
  input: UpdateSiteLayoutInput,
): Promise<SiteActionResult<{ layout: SiteLayout }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", input.siteId)
    .eq("workspace_id", input.workspaceId)
    .maybeSingle();

  if (!site) return { success: false, error: "Site not found.", code: "not_found" };

  const { data, error } = await supabase
    .from("site_layouts")
    .update({
      header_config: input.headerConfig,
      footer_config: input.footerConfig,
      theme_config: input.themeConfig ?? {},
    })
    .eq("site_id", input.siteId)
    .select("*")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Update failed." };

  return { success: true, data: { layout: mapSiteLayoutRow(data) } };
}
