"use client";

import { ChevronLeftIcon, ShieldCheckIcon } from "lucide-react";

import type { WorkspaceTransferStepId } from "@/components/dashboard/team/workspace-transfer/workspace-transfer-dialog";
import { TeamMemberRow } from "@/components/dashboard/team/team-member-row";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeamActiveMember } from "@/types/team";

type WorkspaceTransferShellProps = {
  stepId: WorkspaceTransferStepId;
  stepIndex: number;
  stepCount: number;
  workspaceName: string;
  adminCandidates: TeamActiveMember[];
  selectedAdminId: string | null;
  onSelectAdmin: (userId: string) => void;
  recipientName: string;
  recipientConfirmed: boolean;
  primaryLabel: string;
  primaryDisabled: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
  onCancelTransfer?: () => void;
  onClose?: () => void;
};

const STEP_META: Record<
  WorkspaceTransferStepId,
  { title: string; description: string }
> = {
  intro: {
    title: "Transfer ownership",
    description:
      "You are about to transfer ownership of {{workspace}} to another team member. This is a significant action that affects billing, settings, and member permissions.",
  },
  requirements: {
    title: "Recipient requirements",
    description:
      "The new owner must already be an Admin in this workspace. They will need to accept the transfer before you can complete it.",
  },
  "select-admin": {
    title: "Select new owner",
    description: "Choose an Admin who will receive ownership of this workspace.",
  },
  "await-confirmation": {
    title: "Awaiting confirmation",
    description:
      "The transfer completes only after the recipient accepts and you confirm the final handoff.",
  },
};

export function WorkspaceTransferShell({
  stepId,
  stepIndex,
  stepCount,
  workspaceName,
  adminCandidates,
  selectedAdminId,
  onSelectAdmin,
  recipientName,
  recipientConfirmed,
  primaryLabel,
  primaryDisabled,
  isSubmitting,
  onBack,
  onPrimaryAction,
  onCancelTransfer,
  onClose,
}: WorkspaceTransferShellProps) {
  const meta = STEP_META[stepId];
  const title = meta.title;
  const description = meta.description.replace("{{workspace}}", workspaceName);

  return (
    <div className="bg-card grid min-h-[560px] overflow-hidden rounded-xl border md:grid-cols-[minmax(240px,1fr)_minmax(0,1.65fr)]">
      <aside className="bg-muted/40 flex flex-col justify-between border-b p-8 md:border-r md:border-b-0">
        <div className="space-y-3">
          {stepIndex > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground -ml-2 w-fit px-2"
              onClick={onBack}
              disabled={isSubmitting || stepId === "await-confirmation"}
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>
          ) : null}
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>

        <div className="space-y-6 pt-8 md:pt-0">
          <Button
            type="button"
            className="w-full"
            disabled={primaryDisabled}
            onClick={onPrimaryAction}
          >
            {primaryLabel}
          </Button>
          {onCancelTransfer ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onClick={onCancelTransfer}
            >
              Cancel transfer
            </Button>
          ) : null}
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground w-full"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Close
            </Button>
          ) : null}

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: stepCount }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  index === stepIndex
                    ? "bg-foreground"
                    : index < stepIndex
                      ? "bg-foreground/50"
                      : "bg-muted-foreground/25",
                )}
              />
            ))}
          </div>
        </div>
      </aside>

      <div className="overflow-y-auto p-8">
        {stepId === "intro" ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Transferring ownership gives another person full control over{" "}
              <span className="font-medium">{workspaceName}</span>, including billing, workspace
              settings, and member management.
            </p>
            <p className="text-muted-foreground">
              You will remain a member after the transfer, but your role will change from Owner to
              Admin.
            </p>
          </div>
        ) : null}

        {stepId === "requirements" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <ShieldCheckIcon className="text-primary mt-0.5 size-5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Admin role required</p>
                <p className="text-muted-foreground">
                  Only members with the Admin role can receive ownership. Promote a member to Admin
                  first if needed.
                </p>
              </div>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              Both you and the recipient must confirm the transfer. You can cancel while it is
              still pending.
            </div>
          </div>
        ) : null}

        {stepId === "select-admin" ? (
          <div className="space-y-3">
            {adminCandidates.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No Admin members are available. Promote a member to Admin before transferring
                ownership.
              </p>
            ) : (
              adminCandidates.map((member) => {
                const selected = member.userId === selectedAdminId;
                return (
                  <button
                    key={member.membershipId}
                    type="button"
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                    onClick={() => onSelectAdmin(member.userId)}
                    disabled={isSubmitting}
                  >
                    <TeamMemberRow
                      variant="active"
                      name={member.name}
                      email={member.email}
                      userId={member.userId}
                      roleLabel={member.roleLabel}
                      isOwner={member.isOwner}
                      avatarUrl={member.avatarUrl}
                      currentUserId={member.userId}
                    />
                  </button>
                );
              })
            )}
          </div>
        ) : null}

        {stepId === "await-confirmation" ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              A transfer request was sent to{" "}
              <span className="font-medium">{recipientName}</span>.
            </p>
            <div
              className={cn(
                "rounded-lg border p-4",
                recipientConfirmed ? "border-green-600/30 bg-green-600/5" : "bg-muted/30",
              )}
            >
              <p className="font-medium">
                {recipientConfirmed ? "Recipient accepted" : "Waiting for recipient"}
              </p>
              <p className="text-muted-foreground mt-1">
                {recipientConfirmed
                  ? "You can now finalize the transfer. This step is permanent."
                  : "They will receive a notification to accept the transfer."}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
