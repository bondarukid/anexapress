import { getSiteOrigin } from "@/lib/auth/site-origin";
import { workspaceInviteUrl } from "@/lib/invites/invite-url";
import { createClient } from "@/lib/server";
import {
  formatInviterName,
  inviteNotificationBody,
  inviteNotificationTitle,
} from "@/lib/notifications/format";
import type { AcceptInviteResult, NotificationItem, NotificationKind } from "@/types/notification";

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  invite_id: string | null;
  transfer_id: string | null;
};

type TransferRow = {
  id: string;
  workspace_id: string;
  from_user_id: string;
  to_user_id: string;
  kind: string;
  parent_workspace_id: string | null;
  recipient_confirmed_at: string | null;
  workspaces:
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
  parent_workspace:
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
};

type PendingInviteRow = {
  id: string;
  workspace_id: string;
  join_code: string;
  status: string;
  expires_at: string;
  created_at: string;
  invited_by: string;
  workspaces:
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
};

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type InviterProfile = {
  name: string;
  avatarUrl: string | null;
};

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapNotificationRow(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    read: row.read_at !== null,
    createdAt: row.created_at,
    inviteId: row.invite_id,
    transferId: row.transfer_id,
    transferRole: null,
    workspaceId: null,
    workspaceName: null,
    workspaceSlug: null,
    inviterName: null,
    inviterAvatarUrl: null,
    inviteExpiresAt: null,
    joinCode: null,
    inviteUrl: null,
    parentWorkspaceSlug: null,
  };
}

function inviteUrlForWorkspace(slug: string, joinCode: string): string | null {
  const origin = getSiteOrigin();
  if (!origin) return null;
  return workspaceInviteUrl(origin, slug, joinCode);
}

function mapPendingInviteToNotification(
  row: PendingInviteRow,
  existingInviteIds: Set<string>,
  inviter: InviterProfile,
): NotificationItem | null {
  if (existingInviteIds.has(row.id)) return null;

  const workspace = unwrapRelation(row.workspaces);
  if (!workspace) return null;

  return {
    id: `invite:${row.id}`,
    kind: "workspace_invite",
    title: inviteNotificationTitle(inviter.name),
    body: inviteNotificationBody(inviter.name, workspace.name),
    read: false,
    createdAt: row.created_at,
    inviteId: row.id,
    transferId: null,
    transferRole: null,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
    inviterName: inviter.name,
    inviterAvatarUrl: inviter.avatarUrl,
    inviteExpiresAt: row.expires_at,
    joinCode: row.join_code,
    inviteUrl: inviteUrlForWorkspace(workspace.slug, row.join_code),
    parentWorkspaceSlug: null,
  };
}

/**
 * Load notifications for the current user: persisted rows + pending invites
 * without a notification row (backfill for pre-trigger invites).
 */
export async function getNotificationsForUser(
  userId: string,
  email: string,
): Promise<NotificationItem[]> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("user_notifications")
    .select("id, kind, title, body, read_at, created_at, invite_id, transfer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getNotificationsForUser]", error.message);
    return [];
  }

  const notifications = (rows ?? []).map((row) => mapNotificationRow(row as NotificationRow));

  const inviteIdsWithRow = new Set(
    notifications.map((n) => n.inviteId).filter((id): id is string => id !== null),
  );

  const { data: pendingInvites, error: invitesError } = await supabase
    .from("workspace_invites")
    .select(
      `
            id,
            workspace_id,
            status,
            expires_at,
            created_at,
            join_code,
            invited_by,
            workspaces ( id, name, slug )
        `,
    )
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email);

  if (invitesError) {
    console.error("[getNotificationsForUser invites]", invitesError.message);
  } else {
    const inviterIds = [
      ...new Set((pendingInvites ?? []).map((r) => (r as PendingInviteRow).invited_by)),
    ];
    const inviterProfiles = await loadInviterProfiles(supabase, inviterIds);

    for (const row of pendingInvites ?? []) {
      const inviteRow = row as unknown as PendingInviteRow;
      const mapped = mapPendingInviteToNotification(
        inviteRow,
        inviteIdsWithRow,
        inviterProfiles.get(inviteRow.invited_by) ?? {
          name: "A team member",
          avatarUrl: null,
        },
      );
      if (mapped) notifications.push(mapped);
    }
  }

  const withInvites = await enrichInviteNotifications(supabase, notifications);
  const enriched = await enrichTransferNotifications(supabase, userId, withInvites);

  return enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function enrichInviteNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  notifications: NotificationItem[],
): Promise<NotificationItem[]> {
  const inviteIds = notifications
    .filter((n) => n.kind === "workspace_invite" && n.inviteId)
    .map((n) => n.inviteId as string);

  if (inviteIds.length === 0) return notifications;

  const { data: invites, error: invitesLoadError } = await supabase
    .from("workspace_invites")
    .select(
      `
            id,
            workspace_id,
            join_code,
            invited_by,
            expires_at,
            workspaces ( id, name, slug )
        `,
    )
    .in("id", inviteIds);

  if (invitesLoadError) {
    console.error("[enrichInviteNotifications]", invitesLoadError.message);
  }

  const inviterIds = [
    ...new Set((invites ?? []).map((inv) => (inv as PendingInviteRow).invited_by)),
  ];
  const inviterProfiles = await loadInviterProfiles(supabase, inviterIds);

  const inviteMap = new Map(
    (invites ?? []).map((inv) => {
      const row = inv as PendingInviteRow & { expires_at?: string };
      const workspace = unwrapRelation(row.workspaces);
      const inviter = inviterProfiles.get(row.invited_by) ?? {
        name: "A team member",
        avatarUrl: null,
      };
      const slug = workspace?.slug ?? "";
      const joinCode = row.join_code ?? "";
      return [
        inv.id as string,
        {
          workspaceId: workspace?.id ?? null,
          workspaceName: workspace?.name ?? null,
          workspaceSlug: workspace?.slug ?? null,
          inviterName: inviter.name,
          inviterAvatarUrl: inviter.avatarUrl,
          inviteExpiresAt: row.expires_at ?? null,
          joinCode: joinCode || null,
          inviteUrl: slug && joinCode ? inviteUrlForWorkspace(slug, joinCode) : null,
        },
      ];
    }),
  );

  return notifications.map((n) => {
    if (!n.inviteId) return n;
    const meta = inviteMap.get(n.inviteId);
    if (!meta) return n;
    return {
      ...n,
      workspaceId: meta.workspaceId ?? n.workspaceId,
      workspaceName: meta.workspaceName ?? n.workspaceName,
      workspaceSlug: meta.workspaceSlug ?? n.workspaceSlug,
      inviterName: meta.inviterName ?? n.inviterName,
      inviterAvatarUrl: meta.inviterAvatarUrl ?? n.inviterAvatarUrl,
      inviteExpiresAt: meta.inviteExpiresAt ?? n.inviteExpiresAt,
      joinCode: meta.joinCode ?? n.joinCode,
      inviteUrl: meta.inviteUrl ?? n.inviteUrl,
    };
  });
}

async function enrichTransferNotifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  notifications: NotificationItem[],
): Promise<NotificationItem[]> {
  const transferIds = notifications
    .filter(
      (n) =>
        (n.kind === "workspace_transfer" || n.kind === "workspace_parent_attach") && n.transferId,
    )
    .map((n) => n.transferId as string);

  if (transferIds.length === 0) return notifications;

  const { data: transfers, error } = await supabase
    .from("workspace_transfers")
    .select(
      `
            id,
            workspace_id,
            from_user_id,
            to_user_id,
            kind,
            parent_workspace_id,
            recipient_confirmed_at,
            workspaces ( id, name, slug ),
            parent_workspace:workspaces!workspace_transfers_parent_workspace_id_fkey ( id, name, slug )
        `,
    )
    .in("id", transferIds);

  if (error) {
    console.error("[enrichTransferNotifications]", error.message);
    return notifications;
  }

  const ownerIds = [
    ...new Set((transfers ?? []).map((row) => (row as TransferRow).from_user_id)),
  ];
  const ownerProfiles = await loadInviterProfiles(supabase, ownerIds);

  const transferMap = new Map(
    (transfers ?? []).map((transfer) => {
      const row = transfer as TransferRow;
      const workspace = unwrapRelation(row.workspaces);
      const parentWorkspace = unwrapRelation(row.parent_workspace);
      const owner = ownerProfiles.get(row.from_user_id) ?? {
        name: "A team member",
        avatarUrl: null,
      };
      const isParentAttach = row.kind === "parent_attach";
      return [
        row.id,
        {
          workspaceId: workspace?.id ?? null,
          workspaceName: workspace?.name ?? null,
          workspaceSlug: isParentAttach
            ? (parentWorkspace?.slug ?? workspace?.slug ?? null)
            : (workspace?.slug ?? null),
          parentWorkspaceSlug: parentWorkspace?.slug ?? null,
          inviterName: owner.name,
          inviterAvatarUrl: owner.avatarUrl,
          transferRole:
            row.to_user_id === userId
              ? ("recipient" as const)
              : row.from_user_id === userId
                ? ("owner" as const)
                : null,
        },
      ];
    }),
  );

  return notifications.map((notification) => {
    if (!notification.transferId) return notification;
    const meta = transferMap.get(notification.transferId);
    if (!meta) return notification;
    return {
      ...notification,
      workspaceId: meta.workspaceId ?? notification.workspaceId,
      workspaceName: meta.workspaceName ?? notification.workspaceName,
      workspaceSlug: meta.workspaceSlug ?? notification.workspaceSlug,
      inviterName: meta.inviterName ?? notification.inviterName,
      inviterAvatarUrl: meta.inviterAvatarUrl ?? notification.inviterAvatarUrl,
      transferRole: meta.transferRole ?? notification.transferRole,
      parentWorkspaceSlug: meta.parentWorkspaceSlug ?? notification.parentWorkspaceSlug,
    };
  });
}

async function loadInviterProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[],
): Promise<Map<string, InviterProfile>> {
  const map = new Map<string, InviterProfile>();
  if (userIds.length === 0) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .in("id", userIds);

  if (error) {
    console.error("[loadInviterProfiles]", error.message);
    return map;
  }

  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(row.id, {
      name: formatInviterName(row.first_name, row.last_name),
      avatarUrl: row.avatar_url,
    });
  }

  return map;
}

export async function getUnreadNotificationCount(userId: string, email: string): Promise<number> {
  const items = await getNotificationsForUser(userId, email);
  return items.filter((n) => !n.read).length;
}

function mapAcceptInviteRpcError(message: string): string {
  if (message.includes("invite_not_found")) return "Invitation not found.";
  if (message.includes("invite_not_pending")) return "This invitation is no longer available.";
  if (message.includes("invite_expired")) return "This invitation has expired.";
  if (message.includes("invite_email_mismatch")) {
    return "This invitation was sent to a different email address.";
  }
  if (message.includes("already_member")) return "You are already a member of this workspace.";
  if (message.includes("unauthorized")) return "Session expired. Please sign in again.";
  return message;
}

/** Mark a persisted notification as read (no-op if already read). */
export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);
  return { error: error?.message ?? null };
}

/** Load a notification's kind and linked invite id, scoped to the user. */
export async function getUserNotificationRow(
  userId: string,
  notificationId: string,
): Promise<{ kind: string; inviteId: string | null; transferId: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_notifications")
    .select("id, kind, invite_id, transfer_id")
    .eq("id", notificationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return {
    kind: data.kind,
    inviteId: data.invite_id,
    transferId: data.transfer_id,
  };
}

/** Delete a persisted notification scoped to the user. */
export async function deleteUserNotification(
  userId: string,
  notificationId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);
  return { error: error?.message ?? null };
}

/** Accept a workspace invite via RPC and resolve the resulting membership context. */
export async function acceptWorkspaceInvite(
  userId: string,
  inviteId: string,
): Promise<{ success: true; data: AcceptInviteResult } | { success: false; error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("accept_workspace_invite", {
    p_invite_id: inviteId,
  });

  if (error) {
    return { success: false, error: mapAcceptInviteRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.workspace_id || !row?.workspace_slug) {
    return { success: false, error: "Failed to accept invitation." };
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
    },
  };
}

/** Decline a pending invite and remove its notification for the user. */
export async function declineWorkspaceInvite(
  userId: string,
  inviteId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("workspace_invites")
    .update({ status: "declined" })
    .eq("id", inviteId)
    .eq("status", "pending");

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase
    .from("user_notifications")
    .delete()
    .eq("invite_id", inviteId)
    .eq("user_id", userId);

  return { error: null };
}
