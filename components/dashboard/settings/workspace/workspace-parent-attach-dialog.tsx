"use client";

import * as React from "react";
import { AlertTriangleIcon } from "lucide-react";

import { cancelParentAttachAction } from "@/actions/workspace/cancel-parent-attach";
import { finalizeParentAttachAction } from "@/actions/workspace/finalize-parent-attach";
import { initiateParentAttachAction } from "@/actions/workspace/initiate-parent-attach";
import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import { WorkspaceParentAttachShell } from "@/components/dashboard/settings/workspace/workspace-parent-attach-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ChildWorkspaceSummary } from "@/services/workspace-family";
import type {
  ParentAttachAcceptor,
  WorkspaceParentAttachSummary,
} from "@/types/workspace-transfer";

export type WorkspaceParentAttachStepId =
  | "intro"
  | "requirements"
  | "select-source"
  | "select-acceptor"
  | "await-confirmation";

type WorkspaceParentAttachDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentWorkspaceId: string;
  parentSlug: string;
  parentName: string;
  attachableWorkspaces: ChildWorkspaceSummary[];
  acceptors: ParentAttachAcceptor[];
  pendingAttach: WorkspaceParentAttachSummary | null;
  onAttachChanged: () => void;
};

export function WorkspaceParentAttachDialog({
  open,
  onOpenChange,
  parentWorkspaceId,
  parentSlug,
  parentName,
  attachableWorkspaces,
  acceptors,
  pendingAttach,
  onAttachChanged,
}: WorkspaceParentAttachDialogProps) {
  const toast = useToast();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [selectedSourceId, setSelectedSourceId] = React.useState("");
  const [selectedAcceptorId, setSelectedAcceptorId] = React.useState("");
  const [activeAttach, setActiveAttach] = React.useState<WorkspaceParentAttachSummary | null>(
    pendingAttach,
  );
  const [attachSnapshot, setAttachSnapshot] = React.useState({ open, pendingAttach });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [finalizeOpen, setFinalizeOpen] = React.useState(false);

  if (open && (open !== attachSnapshot.open || pendingAttach !== attachSnapshot.pendingAttach)) {
    setAttachSnapshot({ open, pendingAttach });
    setActiveAttach(pendingAttach);
    if (pendingAttach) {
      setSelectedSourceId(pendingAttach.sourceWorkspaceId);
      setSelectedAcceptorId(pendingAttach.acceptorUserId);
      setStepIndex(4);
    } else {
      setStepIndex(0);
      setSelectedSourceId(attachableWorkspaces[0]?.id ?? "");
      const defaultAcceptor = acceptors.find((a) => a.isOwner) ?? acceptors[0];
      setSelectedAcceptorId(defaultAcceptor?.userId ?? "");
    }
  }

  const selectedSource =
    attachableWorkspaces.find((w) => w.id === selectedSourceId) ??
    (activeAttach
      ? {
          id: activeAttach.sourceWorkspaceId,
          name: activeAttach.sourceWorkspaceName,
          slug: activeAttach.sourceWorkspaceSlug,
          logoUrl: null,
          timezone: "UTC",
        }
      : null);

  const selectedAcceptor =
    acceptors.find((a) => a.userId === selectedAcceptorId) ??
    (activeAttach
      ? {
          userId: activeAttach.acceptorUserId,
          displayName: activeAttach.acceptorDisplayName,
          email: "",
          roleSlug: "owner",
          roleLabel: "Owner",
          isOwner: true,
          avatarUrl: null,
        }
      : null);

  const steps: WorkspaceParentAttachStepId[] = activeAttach
    ? ["intro", "requirements", "select-source", "select-acceptor", "await-confirmation"]
    : ["intro", "requirements", "select-source", "select-acceptor"];

  const currentStep = steps[stepIndex] ?? "intro";
  const isAwaitStep = currentStep === "await-confirmation";
  const recipientReady = Boolean(activeAttach?.recipientConfirmedAt);

  function handleClose() {
    if (isSubmitting) return;
    onOpenChange(false);
  }

  async function handleInitiateAttach() {
    if (!selectedSourceId || !selectedAcceptorId) return;
    setIsSubmitting(true);
    try {
      const result = await initiateParentAttachAction({
        workspaceId: selectedSourceId,
        parentWorkspaceId,
        acceptorUserId: selectedAcceptorId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setActiveAttach({
        transferId: result.data!.transferId,
        sourceWorkspaceId: selectedSourceId,
        sourceWorkspaceName: selectedSource?.name ?? "",
        sourceWorkspaceSlug: selectedSource?.slug ?? "",
        parentWorkspaceId,
        acceptorUserId: selectedAcceptorId,
        acceptorDisplayName: selectedAcceptor?.displayName ?? "",
        recipientConfirmedAt: null,
        status: "pending",
      });
      setStepIndex(4);
      toast.success("Attach request sent");
      onAttachChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelAttach() {
    if (!activeAttach) return;
    setIsSubmitting(true);
    try {
      const result = await cancelParentAttachAction({
        transferId: activeAttach.transferId,
        parentSlug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setActiveAttach(null);
      setStepIndex(0);
      toast.info("Attach request cancelled");
      onAttachChanged();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFinalizeAttach() {
    if (!activeAttach) return;
    setIsSubmitting(true);
    try {
      const result = await finalizeParentAttachAction({
        transferId: activeAttach.transferId,
        parentSlug,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Workspace attached as child");
      setFinalizeOpen(false);
      onOpenChange(false);
      onAttachChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (currentStep === "intro" || currentStep === "requirements") {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (currentStep === "select-source") {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (currentStep === "select-acceptor") {
      if (activeAttach) {
        setStepIndex(4);
        return;
      }
      void handleInitiateAttach();
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
    if (currentStep === "select-source") return "Continue";
    if (currentStep === "select-acceptor") {
      return activeAttach ? "View status" : "Send attach request";
    }
    return recipientReady ? "Finalize attach" : "Waiting for representative";
  })();

  const primaryDisabled =
    isSubmitting ||
    (currentStep === "select-source" && !selectedSourceId) ||
    (currentStep === "select-acceptor" && !selectedAcceptorId) ||
    (isAwaitStep && !recipientReady);

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
        <DialogContent
          className="max-h-[calc(100vh-2rem)] max-w-5xl gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-5xl"
          showCloseButton
        >
          <DialogTitle className="sr-only">Attach workspace under parent</DialogTitle>
          <DialogDescription className="sr-only">
            Attach a root workspace under {parentName} with bilateral confirmation.
          </DialogDescription>
          <WorkspaceParentAttachShell
            stepId={currentStep}
            stepIndex={stepIndex}
            stepCount={steps.length}
            parentName={parentName}
            attachableWorkspaces={attachableWorkspaces}
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSourceId}
            acceptors={acceptors}
            selectedAcceptorId={selectedAcceptorId}
            onSelectAcceptor={setSelectedAcceptorId}
            selectedSourceName={selectedSource?.name ?? ""}
            selectedAcceptorName={selectedAcceptor?.displayName ?? ""}
            selectedAcceptorIsOwner={selectedAcceptor?.isOwner ?? false}
            recipientConfirmed={recipientReady}
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled}
            isSubmitting={isSubmitting}
            onBack={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            onPrimaryAction={handlePrimaryAction}
            onCancelAttach={activeAttach ? () => void handleCancelAttach() : undefined}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>

      <DestructiveAlertDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        title="Attach workspace permanently?"
        description={`${selectedSource?.name ?? "This workspace"} will become a child of ${parentName}. ${selectedAcceptor?.displayName ?? "The parent representative"} has already accepted.`}
        icon={AlertTriangleIcon}
        iconLayout="centered"
        iconVariant="destructiveCircle"
        headerClassName="items-center"
        descriptionClassName="text-center"
        confirmationCheckbox={{ label: "I understand this action is permanent" }}
        confirmLabel="Attach workspace"
        onConfirm={() => void handleFinalizeAttach()}
        confirmLoading={isSubmitting}
        cancelDisabled={isSubmitting}
      />
    </>
  );
}
