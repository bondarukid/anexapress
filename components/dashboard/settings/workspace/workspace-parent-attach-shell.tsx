"use client";

import { ChevronLeftIcon, ShieldCheckIcon } from "lucide-react";

import type { WorkspaceParentAttachStepId } from "@/components/dashboard/settings/workspace/workspace-parent-attach-dialog";
import { TeamMemberRow } from "@/components/dashboard/team/team-member-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ChildWorkspaceSummary } from "@/services/workspace-family";
import type { ParentAttachAcceptor } from "@/types/workspace-transfer";

type WorkspaceParentAttachShellProps = {
  stepId: WorkspaceParentAttachStepId;
  stepIndex: number;
  stepCount: number;
  parentName: string;
  attachableWorkspaces: ChildWorkspaceSummary[];
  selectedSourceId: string;
  onSelectSource: (workspaceId: string) => void;
  acceptors: ParentAttachAcceptor[];
  selectedAcceptorId: string;
  onSelectAcceptor: (userId: string) => void;
  selectedSourceName: string;
  selectedAcceptorName: string;
  selectedAcceptorIsOwner: boolean;
  recipientConfirmed: boolean;
  primaryLabel: string;
  primaryDisabled: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
  onCancelAttach?: () => void;
  onClose?: () => void;
};

const STEP_META: Record<
  WorkspaceParentAttachStepId,
  { title: string; description: string }
> = {
  intro: {
    title: "Attach workspace",
    description:
      "Move an existing root workspace under {{parent}}. Both you and a parent representative must confirm.",
  },
  requirements: {
    title: "Requirements",
    description:
      "You need transfer permission on the source workspace. A parent representative with accept permission must approve.",
  },
  "select-source": {
    title: "Select workspace",
    description: "Choose the root workspace to attach under this parent.",
  },
  "select-acceptor": {
    title: "Parent representative",
    description:
      "Choose who will accept on behalf of {{parent}}. Usually this is the workspace owner.",
  },
  "await-confirmation": {
    title: "Awaiting confirmation",
    description:
      "The attach completes only after the parent representative accepts and you finalize.",
  },
};

export function WorkspaceParentAttachShell({
  stepId,
  stepIndex,
  stepCount,
  parentName,
  attachableWorkspaces,
  selectedSourceId,
  onSelectSource,
  acceptors,
  selectedAcceptorId,
  onSelectAcceptor,
  selectedSourceName,
  selectedAcceptorName,
  selectedAcceptorIsOwner,
  recipientConfirmed,
  primaryLabel,
  primaryDisabled,
  isSubmitting,
  onBack,
  onPrimaryAction,
  onCancelAttach,
  onClose,
}: WorkspaceParentAttachShellProps) {
  const meta = STEP_META[stepId];
  const description = meta.description.replaceAll("{{parent}}", parentName);

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
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{meta.title}</h2>
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
          {onCancelAttach ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onClick={onCancelAttach}
            >
              Cancel attach request
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
              Attaching moves <span className="font-medium">{selectedSourceName || "a workspace"}</span>{" "}
              under <span className="font-medium">{parentName}</span>. The workspace becomes a child
              with shared organizational ownership.
            </p>
            <p className="text-muted-foreground">
              You will remain a member, but the workspace will no longer have a separate owner
              record.
            </p>
          </div>
        ) : null}

        {stepId === "requirements" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <ShieldCheckIcon className="text-primary mt-0.5 size-5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Transfer permission required</p>
                <p className="text-muted-foreground">
                  You need workspace transfer permission on the source workspace. You must also belong
                  to at least one other root workspace.
                </p>
              </div>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              The parent representative (typically the owner) must accept before you can finalize.
            </div>
          </div>
        ) : null}

        {stepId === "select-source" ? (
          <div className="space-y-3">
            {attachableWorkspaces.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No attachable workspaces found. You need transfer permission on another root
                workspace.
              </p>
            ) : (
              <Select value={selectedSourceId} onValueChange={onSelectSource} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {attachableWorkspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : null}

        {stepId === "select-acceptor" ? (
          <div className="space-y-3">
            {acceptors.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No members can accept child attachments on this parent workspace.
              </p>
            ) : (
              acceptors.map((acceptor) => {
                const selected = acceptor.userId === selectedAcceptorId;
                return (
                  <button
                    key={acceptor.userId}
                    type="button"
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                    )}
                    onClick={() => onSelectAcceptor(acceptor.userId)}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <TeamMemberRow
                        variant="active"
                        name={acceptor.displayName}
                        email={acceptor.email}
                        userId={acceptor.userId}
                        roleLabel={acceptor.roleLabel}
                        isOwner={acceptor.isOwner}
                        avatarUrl={acceptor.avatarUrl}
                        currentUserId={acceptor.userId}
                      />
                      {acceptor.isOwner ? (
                        <Badge variant="secondary" className="shrink-0">
                          Owner
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
            {selectedAcceptorId ? (
              <p className="text-muted-foreground text-xs">
                {selectedAcceptorName}
                {selectedAcceptorIsOwner ? " (Owner)" : ""} will accept on behalf of {parentName}.
              </p>
            ) : null}
          </div>
        ) : null}

        {stepId === "await-confirmation" ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              Attach request sent for <span className="font-medium">{selectedSourceName}</span> under{" "}
              <span className="font-medium">{parentName}</span>.
            </p>
            <p>
              Parent representative:{" "}
              <span className="font-medium">
                {selectedAcceptorName}
                {selectedAcceptorIsOwner ? " (Owner)" : ""}
              </span>
            </p>
            <div
              className={cn(
                "rounded-lg border p-4",
                recipientConfirmed ? "border-green-600/30 bg-green-600/5" : "bg-muted/30",
              )}
            >
              <p className="font-medium">
                {recipientConfirmed ? "Representative accepted" : "Waiting for representative"}
              </p>
              <p className="text-muted-foreground mt-1">
                {recipientConfirmed
                  ? "You can now finalize the attach. This step is permanent."
                  : "They will receive a notification to accept the request."}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
