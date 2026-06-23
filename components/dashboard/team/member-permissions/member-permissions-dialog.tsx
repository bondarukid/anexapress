"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";

import { updateMemberVisibilityAction } from "@/actions/team/update-member-visibility";
import { getMemberAccessContextAction } from "@/actions/team/get-member-access-context";
import { updateMemberAccessAction } from "@/actions/team/update-member-access";
import { UserProfilePermissions } from "@/components/dashboard/team/member-permissions/user-profile-permissions";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildPermissionSections,
  CUSTOM_ROLE_SELECT_VALUE,
  findMatchingPresetRoleId,
} from "@/lib/team/permission-catalog";
import {
  canChangeMemberVisibility,
  canManageOtherMemberRole,
  canOpenSelfVisibilityMenu,
} from "@/lib/team/permissions";
import type { MemberAccessContext, TeamActiveMember, UpdateMemberAccessResult } from "@/types/team";

type MemberPermissionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamActiveMember | null;
  currentUserId: string;
  workspaceId: string;
  workspaceSlug: string;
  isChildWorkspace?: boolean;
  canManageVisibility?: boolean;
  canManageAccess?: boolean;
  onSaved?: (result: UpdateMemberAccessResult) => void;
  onVisibilitySaved?: () => void;
};

const footerClassName =
  "mx-0 mb-0 shrink-0 gap-2 rounded-b-xl border-t bg-muted/40 px-6 pt-4 pb-6 sm:justify-end";

export function MemberPermissionsDialog({
  open,
  onOpenChange,
  member,
  currentUserId,
  workspaceId,
  workspaceSlug,
  isChildWorkspace = false,
  canManageVisibility = false,
  canManageAccess = false,
  onSaved,
  onVisibilitySaved,
}: MemberPermissionsDialogProps) {
  const toast = useToast();
  const [context, setContext] = React.useState<MemberAccessContext | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [permissionKeys, setPermissionKeys] = React.useState<Set<string>>(new Set());
  const [isCustom, setIsCustom] = React.useState(false);
  const [isPubliclyVisible, setIsPubliclyVisible] = React.useState(true);
  const [initialVisibility, setInitialVisibility] = React.useState(true);

  const membershipId = member?.membershipId ?? null;
  const isSelf = member?.userId === currentUserId;
  const target = member ? { userId: member.userId, isOwner: member.isOwner } : null;
  const showVisibilityControl =
    Boolean(isChildWorkspace && member) &&
    (canOpenSelfVisibilityMenu(isChildWorkspace, target!, currentUserId) ||
      canChangeMemberVisibility(canManageVisibility, target!, currentUserId));
  const showPermissionEditor =
    Boolean(target) && canManageOtherMemberRole(canManageAccess, target!, currentUserId);
  const visibilityOnly = showVisibilityControl && !showPermissionEditor;

  React.useEffect(() => {
    if (!open || !member) return;

    setIsPubliclyVisible(member.isPubliclyVisible ?? true);
    setInitialVisibility(member.isPubliclyVisible ?? true);
  }, [open, member]);

  React.useEffect(() => {
    if (!open || !membershipId || visibilityOnly) {
      return;
    }

    let cancelled = false;

    async function loadContext() {
      setIsLoading(true);
      setLoadError(null);
      setContext(null);

      const result = await getMemberAccessContextAction({ membershipId: membershipId as string });
      if (cancelled) return;

      if (!result.success || !result.data) {
        setLoadError(result.success ? "Failed to load member access." : result.error);
        setIsLoading(false);
        return;
      }

      const nextContext = result.data;
      setContext(nextContext);
      setSelectedRoleId(nextContext.member.roleId);
      setPermissionKeys(new Set(nextContext.effectivePermissionKeys));
      setIsCustom(nextContext.member.usesCustomPermissions);
      setIsLoading(false);
    }

    void loadContext();

    return () => {
      cancelled = true;
    };
  }, [open, membershipId, visibilityOnly]);

  function syncCustomState(nextKeys: Set<string>, rolePermissionKeys: Record<string, string[]>) {
    const matchingRoleId = findMatchingPresetRoleId(nextKeys, rolePermissionKeys);
    if (matchingRoleId) {
      setSelectedRoleId(matchingRoleId);
      setIsCustom(false);
      return;
    }
    setIsCustom(true);
  }

  function handleRoleChange(roleId: string) {
    if (!context || roleId === CUSTOM_ROLE_SELECT_VALUE) return;

    const keys = context.rolePermissionKeys[roleId] ?? [];
    const nextKeys = new Set(keys);
    setSelectedRoleId(roleId);
    setPermissionKeys(nextKeys);
    setIsCustom(false);
  }

  function handlePermissionToggle(key: string, checked: boolean) {
    if (!context) return;

    const nextKeys = new Set(permissionKeys);
    if (checked) {
      nextKeys.add(key);
    } else {
      nextKeys.delete(key);
    }
    setPermissionKeys(nextKeys);
    syncCustomState(nextKeys, context.rolePermissionKeys);
  }

  async function saveVisibilityIfNeeded(): Promise<boolean> {
    if (!membershipId || !showVisibilityControl) return true;
    if (isPubliclyVisible === initialVisibility) return true;

    const result = await updateMemberVisibilityAction({
      membershipId,
      isPubliclyVisible,
    });

    if (!result.success) {
      toast.error(result.error);
      return false;
    }

    onVisibilitySaved?.();
    return true;
  }

  async function handleSave() {
    if (!membershipId) return;

    setIsSaving(true);
    try {
      const visibilitySaved = await saveVisibilityIfNeeded();
      if (!visibilitySaved) return;

      if (visibilityOnly) {
        toast.success("Visibility updated");
        onOpenChange(false);
        return;
      }

      if (!context || !showPermissionEditor) {
        onOpenChange(false);
        return;
      }

      const matchingRoleId = findMatchingPresetRoleId(permissionKeys, context.rolePermissionKeys);
      const mode = matchingRoleId ? "preset" : "custom";

      const result = await updateMemberAccessAction({
        workspaceId,
        membershipId,
        mode,
        roleId: matchingRoleId ?? selectedRoleId,
        permissionKeys: [...permissionKeys],
        workspaceSlug,
      });

      if (!result.success || !result.data) {
        toast.error(result.success ? "Failed to update access." : result.error);
        return;
      }

      toast.success("Access updated");
      onSaved?.(result.data);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setContext(null);
      setLoadError(null);
      setIsLoading(false);
    }
  }

  const sections = context ? buildPermissionSections(context.permissions) : [];
  const roleOptions =
    context?.assignableRoles.map((role) => ({ value: role.id, label: role.label })) ?? [];
  const visibilityChanged = isPubliclyVisible !== initialVisibility;
  const canSave = visibilityOnly
    ? visibilityChanged
    : Boolean(context && showPermissionEditor) || visibilityChanged;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="bg-muted/20 shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle>{visibilityOnly ? "Workspace visibility" : "Manage access"}</DialogTitle>
          <DialogDescription>
            {member
              ? visibilityOnly
                ? `Control how you appear in ${member.name === member.email ? "this" : "the"} public member list.`
                : `Configure role and permissions for ${member.name}.`
              : "Configure member access."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {isLoading && !visibilityOnly ? (
            <div className="mx-auto max-w-4xl space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-4xl">
              <p className="text-destructive text-sm">{loadError}</p>
            </div>
          ) : member ? (
            <UserProfilePermissions
              variant="embedded"
              user={{
                name: member.name,
                email: member.email,
                role: context
                  ? isCustom
                    ? "Custom"
                    : context.member.roleLabel
                  : member.roleLabel,
                avatar: member.avatarUrl,
              }}
              sections={showPermissionEditor ? sections : []}
              roles={roleOptions}
              selectedRoleId={selectedRoleId}
              permissionKeys={permissionKeys}
              isCustom={isCustom}
              isSaving={isSaving}
              readOnly={!showPermissionEditor}
              showSaveButton={false}
              showVisibilityControl={showVisibilityControl}
              isPubliclyVisible={isPubliclyVisible}
              onVisibilityChange={setIsPubliclyVisible}
              onRoleChange={handleRoleChange}
              onPermissionToggle={handlePermissionToggle}
            />
          ) : null}
        </div>

        <DialogFooter className={footerClassName}>
          <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || isLoading || loadError !== null || !member || !canSave}
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
