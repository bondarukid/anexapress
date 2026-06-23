import { createClient } from "@/lib/server";
import type { TeamActionResult } from "@/types/team";
import type { WorkspaceTransferSummary } from "@/types/workspace-transfer";

function mapRpcError(message: string): string {
  if (message.includes("recipient_must_be_admin")) {
    return "The selected member must have the Admin role.";
  }
  if (message.includes("transfer_already_pending")) {
    return "A workspace transfer is already in progress.";
  }
  if (message.includes("recipient_not_confirmed")) {
    return "The recipient must accept the transfer before you can finalize it.";
  }
  if (message.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("cannot_transfer_to_self")) {
    return "You cannot transfer ownership to yourself.";
  }
  return message;
}

/** Start ownership transfer to an admin member (owner only). */
export async function initiateWorkspaceTransfer(input: {
  workspaceId: string;
  toUserId: string;
}): Promise<TeamActionResult<{ transferId: string }>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("initiate_workspace_transfer", {
      p_workspace_id: input.workspaceId,
      p_to_user_id: input.toUserId,
    });

    if (error) {
      return { success: false, error: mapRpcError(error.message) };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.transfer_id) {
      return { success: false, error: "Transfer could not be started." };
    }

    return { success: true, data: { transferId: row.transfer_id as string } };
  } catch {
    return { success: false, error: "Unexpected server error." };
  }
}

/** Recipient accepts a pending ownership transfer. */
export async function confirmWorkspaceTransferRecipient(
  transferId: string,
): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("confirm_workspace_transfer_recipient", {
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

/** Owner finalizes transfer after recipient confirmation. */
export async function finalizeWorkspaceTransfer(transferId: string): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("finalize_workspace_transfer", {
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

/** Cancel a pending transfer (owner or recipient). */
export async function cancelWorkspaceTransfer(transferId: string): Promise<TeamActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cancel_workspace_transfer", {
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

/** Pending transfer for the current owner, if any. */
export async function getPendingWorkspaceTransfer(
  workspaceId: string,
): Promise<WorkspaceTransferSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_pending_workspace_transfer", {
    p_workspace_id: workspaceId,
  });

  if (error || !data) {
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.transfer_id) {
    return null;
  }

  return {
    transferId: row.transfer_id as string,
    toUserId: row.to_user_id as string,
    recipientConfirmedAt: (row.recipient_confirmed_at as string | null) ?? null,
    status: row.status as string,
  };
}
