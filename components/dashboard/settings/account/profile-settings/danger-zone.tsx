"use client";

import { DestructiveAlertDialog } from "@/components/alert-dialogs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, UserXIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteAccountAction } from "@/actions/user/delete";
import { formatSoloWorkspaceIntro, isSoloWorkspaceConfirmation } from "@/lib/user/delete-account";
import { SoloWorkspaceDeletionList } from "@/components/dashboard/settings/account/profile-settings/solo-workspace-deletion-list";
import { useState } from "react";
import type { SoloOwnedWorkspaceSummary } from "@/types/user";

export const title = "Delete your account permanently";

const DangerZone = () => {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [soloWarningOpen, setSoloWarningOpen] = useState(false);
  const [soloWorkspaces, setSoloWorkspaces] = useState<SoloOwnedWorkspaceSummary[]>([]);

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteAccountAction();

    if (isSoloWorkspaceConfirmation(result)) {
      setSoloWorkspaces(result.soloWorkspaces);
      setConfirmOpen(false);
      setSoloWarningOpen(true);
      setIsDeleting(false);
      return;
    }

    if (!result.success) {
      toast.error(result.error);
      setIsDeleting(false);
    }
  };

  const handleSoloConfirmDelete = async () => {
    setIsDeleting(true);

    const result = await deleteAccountAction({ deleteSoloWorkspaces: true });

    if (!result.success) {
      toast.error("error" in result ? result.error : "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold">Danger Zone</h3>
        <p className="text-muted-foreground text-sm">
          Delete your account permanently. This action will remove all your data and cannot be
          undone{" "}
          <a href="#" className="text-card-foreground font-medium hover:underline">
            Learn more
          </a>
        </p>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent>
            <div className="flex justify-between gap-4 max-lg:flex-col lg:items-center">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Delete account</h3>
                <p className="text-muted-foreground text-sm">
                  Delete your account permanently. This action will remove all your data and cannot
                  be undone.
                </p>
              </div>

              <DestructiveAlertDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                trigger={<Button variant="destructive">Delete Account</Button>}
                title="Clear All Data"
                icon={UserXIcon}
                iconLayout="inline"
                badge="Permanent Action"
                description="This will permanently delete all stored data including user preferences, cache, and local storage. This cannot be undone."
                confirmLabel="Delete Account"
                onConfirm={handleDelete}
                confirmLoading={isDeleting}
                cancelDisabled={isDeleting}
              />

              <DestructiveAlertDialog
                open={soloWarningOpen}
                onOpenChange={setSoloWarningOpen}
                title="Workspace will be deleted"
                icon={AlertTriangleIcon}
                iconLayout="inline"
                badge="Permanent Action"
                contentClassName="sm:max-w-md"
                description={
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      {formatSoloWorkspaceIntro(soloWorkspaces.length)}
                    </p>
                    <SoloWorkspaceDeletionList workspaces={soloWorkspaces} />
                    <p className="text-muted-foreground">
                      Deleting your account will permanently delete these workspaces and all
                      associated data. This cannot be undone.
                    </p>
                  </div>
                }
                confirmLabel="Delete workspace and account"
                onConfirm={handleSoloConfirmDelete}
                confirmLoading={isDeleting}
                cancelDisabled={isDeleting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DangerZone;
