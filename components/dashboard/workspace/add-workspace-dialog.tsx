"use client";

import * as React from "react";
import type { FormEvent } from "react";
import { Plus, Users } from "lucide-react";

import { createAdditionalWorkspaceAction } from "@/actions/workspace/create-workspace";
import { JoinWorkspacePanel } from "@/components/dashboard/workspace/join-workspace-panel";
import { WorkspaceFormPanel, useWorkspaceFormState } from "@/components/dashboard/workspace/workspace-form-panel";
import { useWorkspaceSubmitFlow } from "@/components/dashboard/workspace/use-workspace-creation-flow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJoinWorkspace } from "@/hooks/use-join-workspace";
import { mapWorkspaceCreateFormToAdditionalInput } from "@/lib/workspace/map-create-workspace-input";
import { buildCreateFormValuesFromUser } from "@/lib/workspace/workspace-form-utils";
import { JOIN_CODE_LENGTH } from "@/types/invite";
import type { UserProfile } from "@/types/user";

export type AddWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onCreated?: () => void;
};

const footerClassName =
  "mx-0 mb-0 gap-2 rounded-b-xl border-t bg-muted/40 px-6 pt-4 pb-6 sm:justify-end";

export function AddWorkspaceDialog({
  open,
  onOpenChange,
  user,
  onCreated,
}: AddWorkspaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent className="flex max-h-[min(640px,calc(100vh-2rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {/* Remount on each open so tab/code/form reset without an effect. */}
        <AddWorkspaceDialogBody
          key={open ? "open" : "closed"}
          user={user}
          onOpenChange={onOpenChange}
          onCreated={onCreated}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddWorkspaceDialogBody({
  user,
  onOpenChange,
  onCreated,
}: Pick<AddWorkspaceDialogProps, "user" | "onOpenChange" | "onCreated">) {
  const [tab, setTab] = React.useState("create");
  const [joinCode, setJoinCode] = React.useState("");
  const { runCreation } = useWorkspaceSubmitFlow();
  const { joinByCode, isSubmitting: isJoining } = useJoinWorkspace();
  const { values: formValues, onChange, canSubmit } = useWorkspaceFormState(
    buildCreateFormValuesFromUser(user),
  );
  const [isCreating, setIsCreating] = React.useState(false);

  const canCreate = canSubmit && !isCreating;
  const canJoin = joinCode.length === JOIN_CODE_LENGTH && !isJoining;

  async function handleCreateSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canCreate) return;

    setIsCreating(true);
    try {
      const input = mapWorkspaceCreateFormToAdditionalInput(formValues);
      const result = await runCreation({
        workspaceName: input.workspaceName,
        create: () => createAdditionalWorkspaceAction(input),
      });
      if (result.success) {
        onOpenChange(false);
        onCreated?.();
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    if (!canJoin) return;

    const ok = await joinByCode(joinCode);
    if (ok) {
      onOpenChange(false);
      onCreated?.();
    }
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="bg-muted/20 shrink-0 space-y-3 border-b px-6 py-5 text-left">
        <div className="space-y-1">
          <DialogTitle className="text-lg">Add workspace</DialogTitle>
          <DialogDescription>
            Start a new workspace for your team, or join one you were invited to.
          </DialogDescription>
        </div>
        <TabsList className="grid h-10 w-full grid-cols-2">
          <TabsTrigger value="create" className="gap-1.5 text-xs sm:text-sm">
            <Plus className="size-4" />
            Create new
          </TabsTrigger>
          <TabsTrigger value="join" className="gap-1.5 text-xs sm:text-sm">
            <Users className="size-4" />
            Join with code
          </TabsTrigger>
        </TabsList>
      </DialogHeader>

      <TabsContent
        value="create"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <form onSubmit={handleCreateSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <WorkspaceFormPanel
              mode="create"
              idPrefix="add-"
              values={formValues}
              onChange={onChange}
            />
          </div>
          <DialogFooter className={footerClassName}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canCreate}>
              {isCreating ? "Creating…" : "Create workspace"}
            </Button>
          </DialogFooter>
        </form>
      </TabsContent>

      <TabsContent
        value="join"
        className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
      >
        <form onSubmit={handleJoin} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <JoinWorkspacePanel joinCode={joinCode} onJoinCodeChange={setJoinCode} />
          </div>
          <DialogFooter className={footerClassName}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canJoin}>
              {isJoining ? "Joining…" : "Join workspace"}
            </Button>
          </DialogFooter>
        </form>
      </TabsContent>
    </Tabs>
  );
}
