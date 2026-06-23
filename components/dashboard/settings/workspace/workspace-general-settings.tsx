"use client";

import { Separator } from "@/components/ui/separator";
import { WorkspaceBrandingSection } from "@/components/dashboard/settings/workspace/sections/workspace-branding-section";
import { WorkspaceDangerZoneSection } from "@/components/dashboard/settings/workspace/sections/workspace-danger-zone-section";
import { WorkspaceDataExportSection } from "@/components/dashboard/settings/workspace/sections/workspace-data-export-section";
import { WorkspaceGeneralSection } from "@/components/dashboard/settings/workspace/sections/workspace-general-section";
import { WorkspaceTimezoneSection } from "@/components/dashboard/settings/workspace/sections/workspace-timezone-section";
import { canInitiateWorkspaceTransfer, canUpdateWorkspaceSettings } from "@/lib/team/permissions";
import type { TeamActiveMember, WorkspaceAccessPermissions } from "@/types/team";
import type { WorkspaceSummary } from "@/types/workspace";
import type { WorkspaceTransferSummary } from "@/types/workspace-transfer";

export type WorkspaceGeneralSettingsProps = {
  workspace: WorkspaceSummary;
  workspaceAccess: WorkspaceAccessPermissions;
  currentUserId: string;
  members: TeamActiveMember[];
  activeMemberCount: number;
  pendingTransfer: WorkspaceTransferSummary | null;
};

/**
 * Account Settings 03 — workspace general settings (manual port from Shadcn Studio).
 */
export function WorkspaceGeneralSettings({
  workspace,
  workspaceAccess,
  currentUserId,
  members,
  activeMemberCount,
  pendingTransfer,
}: WorkspaceGeneralSettingsProps) {
  const canUpdate = canUpdateWorkspaceSettings(workspaceAccess);
  const canTransfer = canInitiateWorkspaceTransfer(workspaceAccess);
  const canDelete = workspaceAccess.canDelete;
  const isRootParent = !workspace.isChild;

  return (
    <section className="flex flex-col gap-8 py-3">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-heading text-foreground text-2xl font-semibold tracking-tight">
          General
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Manage workspace identity, defaults, and security controls for your organization.
        </p>
      </header>

      <div className="mx-auto w-full max-w-7xl">
        <WorkspaceGeneralSection workspace={workspace} canUpdate={canUpdate} />
        <Separator className="my-10" />
        <WorkspaceTimezoneSection
          key={`${workspace.id}-${workspace.timezone}`}
          workspace={workspace}
          canUpdate={canUpdate}
        />
        <Separator className="my-10" />
        <WorkspaceBrandingSection
          key={`${workspace.id}-${workspace.websiteUrl ?? ""}`}
          workspace={workspace}
          canUpdate={canUpdate}
        />
        {canUpdate ? (
          <>
            <Separator className="my-10" />
            <WorkspaceDataExportSection />
          </>
        ) : null}
        <Separator className="my-10" />
        <WorkspaceDangerZoneSection
          workspace={workspace}
          currentUserId={currentUserId}
          members={members}
          activeMemberCount={activeMemberCount}
          pendingTransfer={pendingTransfer}
          canTransfer={canTransfer && isRootParent}
          canDelete={canDelete}
          isOwner={workspace.roleSlug === "owner"}
        />
      </div>
    </section>
  );
}
