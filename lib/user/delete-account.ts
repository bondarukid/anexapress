import type { DeleteAccountResponse, DeleteAccountSoloConfirmation } from "@/types/user";

export type {
  DeleteAccountError,
  DeleteAccountResponse,
  DeleteAccountSoloConfirmation,
  DeleteAccountSuccess,
} from "@/types/user";

export function isSoloWorkspaceConfirmation(
  result: DeleteAccountResponse,
): result is DeleteAccountSoloConfirmation {
  return (
    !result.success &&
    "requiresSoloWorkspaceConfirmation" in result &&
    result.requiresSoloWorkspaceConfirmation
  );
}

export function formatSoloWorkspaceIntro(workspaceCount: number): string {
  if (workspaceCount === 1) {
    return "You are the only member of this workspace.";
  }

  return `You are the only member of ${workspaceCount} workspaces.`;
}
