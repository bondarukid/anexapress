"use client";

import * as React from "react";
import { AlertTriangleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { cancelWorkspaceTransferAction } from "@/actions/team/cancel-workspace-transfer";
import { finalizeWorkspaceTransferAction } from "@/actions/team/finalize-workspace-transfer";
import { initiateWorkspaceTransferAction } from "@/actions/team/initiate-workspace-transfer";
import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import { WorkspaceTransferShell } from "@/components/dashboard/team/workspace-transfer/workspace-transfer-shell";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { TeamActiveMember } from "@/types/team";
import type { WorkspaceTransferSummary } from "@/types/workspace-transfer";

export type WorkspaceTransferStepId =
  | "intro"
  | "requirements"
  | "select-admin"
  | "await-confirmation";

type WorkspaceTransferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
  members: TeamActiveMember[];
  currentUserId: string;
  pendingTransfer: WorkspaceTransferSummary | null;
  onTransferChanged: () => void;
};

export function WorkspaceTransferDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceSlug,
  workspaceName,
  members,
  currentUserId,
  pendingTransfer,
  onTransferChanged,
}: WorkspaceTransferDialogProps) {
  const toast = useToast();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [selectedAdminId, setSelectedAdminId] = React.useState<string | null>(null);
  const [activeTransfer, setActiveTransfer] = React.useState<WorkspaceTransferSummary | null>(
    pendingTransfer,
  );
  const [transferSnapshot, setTransferSnapshot] = React.useState({
    open,
    pendingTransfer,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [finalizeOpen, setFinalizeOpen] = React.useState(false);

  if (
    open &&
    (open !== transferSnapshot.open || pendingTransfer !== transferSnapshot.pendingTransfer)
  ) {
    setTransferSnapshot({ open, pendingTransfer });
    setActiveTransfer(pendingTransfer);
    if (pendingTransfer) {
      setSelectedAdminId(pendingTransfer.toUserId);
      setStepIndex(3);
    } else {
      setStepIndex(0);
      setSelectedAdminId(null);
    }
  }

  const adminCandidates = React.useMemo(
    () =>
      members.filter(
        (member) =>
          member.roleSlug === "admin" &&
          !member.isOwner &&
          member.userId !== currentUserId,
      ),
    [members, currentUserId],
  );

  const selectedAdmin = adminCandidates.find((member) => member.userId === selectedAdminId) ?? null;
  const recipientMember =
    activeTransfer !== null
      ? (members.find((member) => member.userId === activeTransfer.toUserId) ?? null)
      : null;

  const steps: WorkspaceTransferStepId[] = activeTransfer
    ? ["intro", "requirements", "select-admin", "await-confirmation"]
    : ["intro", "requirements", "select-admin"];

  const currentStep = steps[stepIndex] ?? "intro";
  const isAwaitStep = currentStep === "await-confirmation";
  const recipientReady = Boolean(activeTransfer?.recipientConfirmedAt);

  function handleClose() {
    if (isSubmitting) return;
    onOpenChange(false);
  }

  async function handleInitiateTransfer() {
    if (!selectedAdminId) return;
    setIsSubmitting(true);
    try {
      const result = await initiateWorkspaceTransferAction({
        workspaceId,
        toUserId: selectedAdminId,
        workspaceSlug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setActiveTransfer({
        transferId: result.data!.transferId,
        toUserId: selectedAdminId,
        recipientConfirmedAt: null,
        status: "pending",
      });
      setStepIndex(3);
      toast.success("Transfer request sent");
      onTransferChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelTransfer() {
    if (!activeTransfer) return;
    setIsSubmitting(true);
    try {
      const result = await cancelWorkspaceTransferAction({
        transferId: activeTransfer.transferId,
        workspaceSlug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setActiveTransfer(null);
      setSelectedAdminId(null);
      setStepIndex(0);
      toast.info("Transfer cancelled");
      onTransferChanged();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalizeTransfer() {
    if (!activeTransfer) return;
    setIsSubmitting(true);
    try {
      const result = await finalizeWorkspaceTransferAction({
        transferId: activeTransfer.transferId,
        workspaceSlug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Ownership transferred");
      setFinalizeOpen(false);
      onOpenChange(false);
      onTransferChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (currentStep === "intro" || currentStep === "requirements") {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (currentStep === "select-admin") {
      if (activeTransfer) {
        setStepIndex(3);
        return;
      }
      void handleInitiateTransfer();
      return;
    }

    if (recipientReady) {
      setFinalizeOpen(true);
    }
  }

  const primaryLabel = (() => {
    if (isSubmitting) return "Please wait...";
    if (currentStep === "intro") return "Continue";
    if (currentStep === "requirements") return "Continue";
    if (currentStep === "select-admin") {
      return activeTransfer ? "View status" : "Send transfer request";
    }
    return recipientReady ? "Finalize transfer" : "Waiting for recipient";
  })();

  const primaryDisabled =
    isSubmitting ||
    (currentStep === "select-admin" && !selectedAdminId) ||
    (isAwaitStep && !recipientReady);

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
        <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
        <DialogContent
          className="max-h-[calc(100vh-2rem)] max-w-5xl gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-5xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">Transfer workspace ownership</DialogTitle>
          <DialogDescription className="sr-only">
            Transfer ownership of {workspaceName} to another admin member.
          </DialogDescription>
          <WorkspaceTransferShell
            stepId={currentStep}
            stepIndex={stepIndex}
            stepCount={steps.length}
            workspaceName={workspaceName}
            adminCandidates={adminCandidates}
            selectedAdminId={selectedAdminId}
            onSelectAdmin={setSelectedAdminId}
            recipientName={recipientMember?.name ?? selectedAdmin?.name ?? "the selected admin"}
            recipientConfirmed={recipientReady}
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled}
            isSubmitting={isSubmitting}
            onBack={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            onPrimaryAction={handlePrimaryAction}
            onCancelTransfer={activeTransfer ? () => void handleCancelTransfer() : undefined}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      <DestructiveAlertDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        title="Transfer ownership permanently?"
        description={`You will lose owner access to ${workspaceName}. ${recipientMember?.name ?? "The recipient"} will become the new owner.`}
        icon={AlertTriangleIcon}
        iconLayout="centered"
        iconVariant="destructiveCircle"
        headerClassName="items-center"
        descriptionClassName="text-center"
        confirmationCheckbox={{ label: "I understand this action is permanent" }}
        confirmLabel="Transfer ownership"
        onConfirm={() => void handleFinalizeTransfer()}
        confirmLoading={isSubmitting}
        cancelDisabled={isSubmitting}
      />
    </>
  );
}
