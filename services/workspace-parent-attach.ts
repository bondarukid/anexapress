import { createClient } from "@/lib/server";
import type { TeamActionResult } from "@/types/team";
import type {
  ParentAttachAcceptor,
  WorkspaceParentAttachSummary,
} from "@/types/workspace-transfer";

function mapRpcError(message: string): string {
  if (message.includes("acceptor_must_have_permission")) {
    return "The selected member cannot accept child workspace attachments.";
  }
  if (message.includes("attach_already_pending")) {
    return "An attach request is already in progress for this workspace.";
  }
  if (message.includes("recipient_not_confirmed")) {
    return "The parent representative must accept before you can finalize.";
  }
  if (message.includes("must_have_another_root_workspace")) {
    return "You must belong to at least one other root workspace before attaching this one.";
  }
  if (message.includes("source_must_be_root")) {
    return "Only root workspaces can be attached to a parent.";
  }
  if (message.includes("parent_must_be_root")) {
    return "Child workspaces can only be attached under a root parent.";
  }
  if (message.includes("cannot_attach_to_self")) {
    return "A workspace cannot be attached to itself.";
  }
  if (message.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }
  return message;
}

type ParentAttachRpcRow = {
  transfer_id: string;
  token?: string;
};

type PendingParentAttachRow = {
  transfer_id: string;
  source_workspace_id: string;
  source_workspace_name: string;
  source_workspace_slug: string;
  parent_workspace_id: string;
  acceptor_user_id: string;
  acceptor_display_name: string;
  recipient_confirmed_at: string | null;
  status: string;
};

type AcceptorRow = {
  user_id: string;
  email: string;
  display_name: string;
  role_slug: string;
  role_label: string;
  is_owner: boolean;
  avatar_url: string | null;
};

/** Start bilateral attach of a root workspace under a parent. */
export async function initiateWorkspaceParentAttach(input: {
  sourceWorkspaceId: string;
  parentWorkspaceId: string;
  acceptorUserId: string;
}): Promise<TeamActionResult<{ transferId: string }>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("initiate_workspace_parent_attach", {
      p_source_id: input.sourceWorkspaceId,
      p_parent_id: input.parentWorkspaceId,
      p_acceptor_user_id: input.acceptorUserId,
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    const row = (Array.isArray(data) ? data[0] : data) as ParentAttachRpcRow | null;
    if (!row?.transfer_id) {
      return { success: false, error: "Attach request could not be started." };
    }

    return { success: true, data: { transferId: row.transfer_id } };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Parent-side representative accepts a pending attach request. */
export async function confirmWorkspaceParentAttachRecipient(
  transferId: string,
): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("confirm_workspace_parent_attach_recipient", {
      p_transfer_id: transferId,
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Initiator finalizes attach after parent representative confirmation. */
export async function finalizeWorkspaceParentAttach(transferId: string): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("finalize_workspace_parent_attach", {
      p_transfer_id: transferId,
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Cancel a pending parent attach (initiator or acceptor). */
export async function cancelWorkspaceParentAttach(transferId: string): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cancel_workspace_parent_attach", {
      p_transfer_id: transferId,
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Pending parent attach initiated by the current user for a parent workspace. */
export async function getPendingWorkspaceParentAttach(
  parentWorkspaceId: string,
): Promise<WorkspaceParentAttachSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_pending_workspace_parent_attach", {
    p_parent_id: parentWorkspaceId,
  });

  if (error || !data) {
    return null;
  }

  const row = (Array.isArray(data) ? data[0] : data) as PendingParentAttachRow | null;
  if (!row?.transfer_id) {
    return null;
  }

  return {
    transferId: row.transfer_id,
    sourceWorkspaceId: row.source_workspace_id,
    sourceWorkspaceName: row.source_workspace_name,
    sourceWorkspaceSlug: row.source_workspace_slug,
    parentWorkspaceId: row.parent_workspace_id,
    acceptorUserId: row.acceptor_user_id,
    acceptorDisplayName: row.acceptor_display_name,
    recipientConfirmedAt: row.recipient_confirmed_at,
    status: row.status,
  };
}

/** Members on the parent workspace who can accept child attach requests. */
export async function getParentAttachAcceptors(
  parentWorkspaceId: string,
): Promise<ParentAttachAcceptor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_parent_attach_acceptors", {
    p_parent_id: parentWorkspaceId,
  });

  if (error) return [];

  return (data ?? []).map((row: AcceptorRow) => ({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    roleSlug: row.role_slug,
    roleLabel: row.role_label,
    isOwner: row.is_owner,
    avatarUrl: row.avatar_url,
  }));
}
