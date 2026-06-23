import { randomBytes } from "crypto";

import { buildInviteCreatedPayload } from "@/lib/invite/build-created-payload";
import { mapJoinByCodeError } from "@/lib/invites/map-join-error";
import { workspaceInvitePath } from "@/lib/routing/workspace-paths";
import { createClient } from "@/lib/server";
import type {
  InviteActionResult,
  InviteCreatedPayload,
  InviteLandingContext,
  JoinWorkspaceByCodeResult,
} from "@/types/invite";

export async function hasPendingEmailInvites(email: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("workspace_invites")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email.trim().toLowerCase());

  if (error) {
    console.error("[hasPendingEmailInvites]", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

export async function getFirstPendingEmailInvite(
  email: string,
): Promise<{ id: string; joinCode: string; workspaceSlug: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_invites")
    .select(
      `
            id,
            join_code,
            workspaces ( slug )
        `,
    )
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email.trim().toLowerCase())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[getFirstPendingEmailInvite]", error.message);
    return null;
  }

  const ws = data.workspaces as { slug: string } | { slug: string }[] | null;
  const slug = Array.isArray(ws) ? ws[0]?.slug : ws?.slug;
  if (!slug || !data.join_code) return null;

  return {
    id: data.id,
    joinCode: data.join_code,
    workspaceSlug: slug,
  };
}

export async function getInviteLandingContext(
  joinCode: string,
): Promise<InviteLandingContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invite_landing_context", {
    p_join_code: joinCode,
  });

  if (error) {
    console.error("[getInviteLandingContext]", error.message);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.workspace_id || !row?.workspace_slug) return null;

  return {
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    workspaceSlug: row.workspace_slug,
    inviteKind: row.invite_kind as InviteLandingContext["inviteKind"],
    expiresAt: row.expires_at,
    isValid: Boolean(row.is_valid),
  };
}

export function buildInviteUrlForSlug(
  origin: string,
  workspaceSlug: string,
  joinCode: string,
): string {
  const path = workspaceInvitePath(workspaceSlug, joinCode);
  return `${origin.replace(/\/$/, "")}${path}`;
}

/**
 * Create a pending email invite for a workspace member. Rejects duplicates and
 * the owner role. Cache revalidation is the caller's responsibility.
 */
export async function createEmailInvite(input: {
  workspaceId: string;
  email: string;
  roleId: string;
  workspaceSlug?: string;
}): Promise<InviteActionResult<InviteCreatedPayload>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const email = input.email.trim().toLowerCase();
    const workspaceSlug = input.workspaceSlug?.trim();

    const { data: members } = await supabase.rpc("get_workspace_team_members", {
      p_workspace_id: input.workspaceId,
    });

    if ((members ?? []).some((m: { email: string }) => m.email.toLowerCase() === email)) {
      return { success: false, error: "This user is already a member." };
    }

    const { data: pendingInvite } = await supabase
      .from("workspace_invites")
      .select("id")
      .eq("workspace_id", input.workspaceId)
      .eq("status", "pending")
      .ilike("email", email)
      .maybeSingle();

    if (pendingInvite) {
      return {
        success: false,
        error: "An invitation is already pending for this email.",
      };
    }

    const { data: role } = await supabase
      .from("roles")
      .select("id, slug")
      .eq("id", input.roleId)
      .eq("workspace_id", input.workspaceId)
      .neq("slug", "owner")
      .maybeSingle();

    if (!role) {
      return { success: false, error: "Selected role is not available." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { data: inserted, error } = await supabase
      .from("workspace_invites")
      .insert({
        workspace_id: input.workspaceId,
        email,
        role_id: input.roleId,
        invited_by: user.id,
        token: randomBytes(32).toString("hex"),
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id, join_code, expires_at, workspaces ( slug )")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const ws = inserted.workspaces as { slug: string } | { slug: string }[] | null;
    const slug = workspaceSlug ?? (Array.isArray(ws) ? ws[0]?.slug : ws?.slug) ?? "";

    if (!slug || !inserted.join_code) {
      return { success: false, error: "Invite created but response was invalid." };
    }

    const payload = buildInviteCreatedPayload(slug, inserted.join_code, inserted.expires_at, {
      inviteId: inserted.id,
    });

    if ("error" in payload) {
      return { success: false, error: payload.error };
    }

    return { success: true, data: payload };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/**
 * Accept a workspace join by code via RPC and resolve the resulting membership
 * context. Cookie clearing and cache revalidation are the caller's responsibility.
 */
export async function joinWorkspaceByCode(
  userId: string,
  joinCode: string,
): Promise<InviteActionResult<JoinWorkspaceByCodeResult>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("accept_workspace_join_by_code", {
      p_join_code: joinCode,
    });

    if (error) {
      return { success: false, error: mapJoinByCodeError(error.message) };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.workspace_id || !row?.workspace_slug) {
      return { success: false, error: "Failed to join workspace." };
    }

    const { data: memberRow } = await supabase
      .from("workspace_members")
      .select("roles ( slug )")
      .eq("workspace_id", row.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();

    const role = memberRow?.roles as { slug: string } | { slug: string }[] | null | undefined;
    const roleSlug = Array.isArray(role) ? (role[0]?.slug ?? "member") : (role?.slug ?? "member");

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("logo_url, timezone")
      .eq("id", row.workspace_id)
      .maybeSingle();

    return {
      success: true,
      data: {
        workspaceId: row.workspace_id,
        workspaceName: row.workspace_name,
        workspaceSlug: row.workspace_slug,
        logoUrl: workspace?.logo_url ?? null,
        timezone: workspace?.timezone ?? "UTC",
        roleSlug,
        source: row.source === "join_link" ? "join_link" : "email_invite",
      },
    };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/**
 * Create a shareable workspace join link via the `create_workspace_join_link` RPC.
 * Cache revalidation is the caller's responsibility.
 */
export async function createJoinLink(input: {
  workspaceId: string;
  roleId: string;
  workspaceSlug?: string;
  expiresInDays: number;
}): Promise<InviteActionResult<InviteCreatedPayload>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

    const { data, error } = await supabase.rpc("create_workspace_join_link", {
      p_workspace_id: input.workspaceId,
      p_role_id: input.roleId,
      p_expires_at: expiresAt.toISOString(),
    });

    if (error) {
      return { success: false, error: mapJoinByCodeError(error.message) };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.join_code || !row?.expires_at) {
      return { success: false, error: "Failed to create join link." };
    }

    let slug = input.workspaceSlug?.trim();
    if (!slug) {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("slug")
        .eq("id", input.workspaceId)
        .maybeSingle();
      slug = workspace?.slug ?? "";
    }

    if (!slug) {
      return { success: false, error: "Workspace slug not found." };
    }

    const payload = buildInviteCreatedPayload(slug, row.join_code, row.expires_at, {
      joinLinkId: row.id,
    });

    if ("error" in payload) {
      return { success: false, error: payload.error };
    }

    return { success: true, data: payload };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}
