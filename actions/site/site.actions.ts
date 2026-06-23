"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import {
  createSiteSchema,
  updateSiteSettingsSchema,
  createSitePageSchema,
  saveSitePageDraftSchema,
  publishSitePageSchema,
  createSitePageSnapshotSchema,
  revertSitePageVersionSchema,
} from "@/schemas/site.schema";
import { updateSiteLayoutSchema } from "@/schemas/site-layout.schema";
import {
  createSite,
  listSites,
  updateSiteSettings,
  provisionDefaultSite,
} from "@/services/site.service";
import {
  createSitePage,
  saveSitePageDraft,
  publishSitePage,
  createSitePageSnapshot,
  revertSitePageVersion,
} from "@/services/site-page.service";
import { updateSiteLayout } from "@/services/site-layout.service";
import {
  addSiteDomain,
  listSiteDomains,
  removeSiteDomain,
  setPrimarySiteDomain,
} from "@/services/site-domain.service";
import {
  createSiteTextFile,
  deleteSiteFile,
  listSiteFiles,
  uploadSiteFile,
} from "@/services/site-file.service";
import {
  addSiteDomainSchema,
  removeSiteDomainSchema,
  setPrimarySiteDomainSchema,
} from "@/schemas/site-domain.schema";
import type { RevertedDraftData, SiteActionResult } from "@/types/site";

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createSiteAction(input: unknown): Promise<SiteActionResult<{ siteId: string }>> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const parsed = createSiteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }

  const result = await createSite(userId, parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function updateSiteSettingsAction(input: unknown): Promise<SiteActionResult> {
  const parsed = updateSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }

  const result = await updateSiteSettings(parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function updateSiteLayoutAction(input: unknown) {
  const parsed = updateSiteLayoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await updateSiteLayout(parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function createSitePageAction(input: unknown): Promise<SiteActionResult<{ pageId: string }>> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const parsed = createSitePageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }

  const result = await createSitePage(userId, parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function saveSitePageDraftAction(input: unknown) {
  const userId = await getUserId();
  if (!userId) return { success: false as const, error: "Session expired." };

  const parsed = saveSitePageDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await saveSitePageDraft(userId, parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function publishSitePageAction(input: unknown): Promise<SiteActionResult> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const parsed = publishSitePageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }

  const result = await publishSitePage(
    userId,
    parsed.data.workspaceId,
    parsed.data.siteId,
    parsed.data.pageId,
  );
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function createSitePageSnapshotAction(input: unknown) {
  const userId = await getUserId();
  if (!userId) return { success: false as const, error: "Session expired." };

  const parsed = createSitePageSnapshotSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  return createSitePageSnapshot(
    userId,
    parsed.data.workspaceId,
    parsed.data.siteId,
    parsed.data.pageId,
  );
}

export async function revertSitePageVersionAction(
  input: unknown,
): Promise<SiteActionResult<RevertedDraftData>> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const parsed = revertSitePageVersionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }

  return revertSitePageVersion(
    userId,
    parsed.data.workspaceId,
    parsed.data.siteId,
    parsed.data.pageId,
    parsed.data.versionId,
  );
}

export async function ensureDefaultSiteAction(workspaceId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false as const, error: "Session expired." };
  return provisionDefaultSite(workspaceId, userId);
}

export async function addSiteDomainAction(input: unknown): Promise<SiteActionResult<{ domainId: string }>> {
  const parsed = addSiteDomainSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }
  const result = await addSiteDomain(parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function removeSiteDomainAction(input: unknown): Promise<SiteActionResult> {
  const parsed = removeSiteDomainSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }
  const result = await removeSiteDomain(parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function setPrimarySiteDomainAction(input: unknown): Promise<SiteActionResult> {
  const parsed = setPrimarySiteDomainSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "validation" };
  }
  const result = await setPrimarySiteDomain(parsed.data);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export { listSites, listSiteDomains, listSiteFiles };

export async function uploadSiteFileAction(formData: FormData): Promise<SiteActionResult<{ fileId: string }>> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const siteId = String(formData.get("siteId") ?? "");
  const publicPath = String(formData.get("publicPath") ?? "");
  const file = formData.get("file");

  if (!workspaceId || !siteId || !publicPath || !(file instanceof File)) {
    return { success: false, error: "Missing required fields.", code: "validation" };
  }

  const result = await uploadSiteFile(userId, workspaceId, siteId, publicPath, file);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function createSiteTextFileAction(input: {
  workspaceId: string;
  siteId: string;
  publicPath: string;
  content: string;
  mimeType?: string;
}): Promise<SiteActionResult<{ fileId: string }>> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Session expired." };

  const result = await createSiteTextFile(
    userId,
    input.workspaceId,
    input.siteId,
    input.publicPath,
    input.content,
    input.mimeType,
  );
  if (result.success) revalidatePath("/", "layout");
  return result;
}

export async function deleteSiteFileAction(input: {
  workspaceId: string;
  siteId: string;
  fileId: string;
}): Promise<SiteActionResult> {
  const result = await deleteSiteFile(input.workspaceId, input.siteId, input.fileId);
  if (result.success) revalidatePath("/", "layout");
  return result;
}

