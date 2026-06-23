import { createClient } from "@/lib/server";
import { PERM_CONTENT_CREATE } from "@/lib/team/permissions";
import { requireWorkspacePermission } from "@/services/team";
import type {
  AddSiteDomainInput,
  RemoveSiteDomainInput,
  SetPrimarySiteDomainInput,
} from "@/schemas/site-domain.schema";
import type { SiteActionResult, SiteDomain } from "@/types/site";

async function assertSiteInWorkspace(siteId: string, workspaceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return Boolean(data);
}

function mapDomainRow(row: {
  id: string;
  site_id: string;
  domain: string;
  is_primary: boolean;
  created_at: string;
}): SiteDomain {
  return {
    id: row.id,
    siteId: row.site_id,
    domain: row.domain,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

export async function listSiteDomains(siteId: string): Promise<SiteDomain[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_domains")
    .select("id, site_id, domain, is_primary, created_at")
    .eq("site_id", siteId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDomainRow);
}

export async function addSiteDomain(input: AddSiteDomainInput): Promise<SiteActionResult<{ domainId: string }>> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const inWorkspace = await assertSiteInWorkspace(input.siteId, input.workspaceId);
  if (!inWorkspace) return { success: false, error: "Site not found.", code: "not_found" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_domains")
    .select("id")
    .eq("domain", input.domain)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "This domain is already in use.", code: "validation" };
  }

  const isPrimary = input.isPrimary ?? false;

  if (isPrimary) {
    await supabase
      .from("site_domains")
      .update({ is_primary: false })
      .eq("site_id", input.siteId);
  }

  const { data, error } = await supabase
    .from("site_domains")
    .insert({
      site_id: input.siteId,
      domain: input.domain,
      is_primary: isPrimary,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to add domain." };
  }

  return { success: true, data: { domainId: data.id } };
}

export async function removeSiteDomain(input: RemoveSiteDomainInput): Promise<SiteActionResult> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const inWorkspace = await assertSiteInWorkspace(input.siteId, input.workspaceId);
  if (!inWorkspace) return { success: false, error: "Site not found.", code: "not_found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_domains")
    .delete()
    .eq("id", input.domainId)
    .eq("site_id", input.siteId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function setPrimarySiteDomain(input: SetPrimarySiteDomainInput): Promise<SiteActionResult> {
  const guard = await requireWorkspacePermission(input.workspaceId, PERM_CONTENT_CREATE);
  if (!guard.success) return { success: false, error: guard.error, code: "forbidden" };

  const inWorkspace = await assertSiteInWorkspace(input.siteId, input.workspaceId);
  if (!inWorkspace) return { success: false, error: "Site not found.", code: "not_found" };

  const supabase = await createClient();

  await supabase
    .from("site_domains")
    .update({ is_primary: false })
    .eq("site_id", input.siteId);

  const { error } = await supabase
    .from("site_domains")
    .update({ is_primary: true })
    .eq("id", input.domainId)
    .eq("site_id", input.siteId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
