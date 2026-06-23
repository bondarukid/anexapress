"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { InviteJoinDetailsCard } from "@/components/dashboard/invites/invite-join-details-card";
import { AcceptInvite } from "@/components/dashboard/invites/accept-invite";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatInviteExpirationText } from "@/lib/notifications/invite-expiration";
import { workspacePath } from "@/lib/routing/workspace-paths";
import {
  isTransferLikeNotification,
  isWorkspaceInviteNotification,
  isWorkspaceParentAttachNotification,
  isWorkspaceTransferNotification,
  type NotificationItem,
} from "@/types/notification";

type MailDisplayProps = {
  notification: NotificationItem | null;
  isPending?: boolean;
  onDelete: () => void;
  onAccept: () => void;
  onDecline: () => void;
};

export function MailDisplay({
  notification,
  isPending = false,
  onDelete,
  onAccept,
  onDecline,
}: MailDisplayProps) {
  const isRecipientTransfer =
    notification !== null &&
    isTransferLikeNotification(notification.kind) &&
    notification.transferRole === "recipient";

  const isOwnerTransferReady =
    notification !== null &&
    isTransferLikeNotification(notification.kind) &&
    notification.transferRole === "owner";

  const isParentAttachRecipient =
    notification !== null &&
    isWorkspaceParentAttachNotification(notification.kind) &&
    notification.transferRole === "recipient";

  const isParentAttachInitiatorReady =
    notification !== null &&
    isWorkspaceParentAttachNotification(notification.kind) &&
    notification.transferRole === "owner";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[52px] items-center px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!notification || isPending}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
      <Separator />
      {notification ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-start p-4">
            <div className="grid gap-1">
              <div className="font-semibold">{notification.title}</div>
              <div className="text-muted-foreground text-xs">
                {format(new Date(notification.createdAt), "PPpp")}
              </div>
            </div>
          </div>
          {isWorkspaceInviteNotification(notification.kind) && notification.inviteId ? (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-4 py-8">
              <AcceptInvite
                hostName={notification.inviterName ?? "A team member"}
                hostAvatarUrl={notification.inviterAvatarUrl}
                workspaceName={notification.workspaceName ?? "Workspace"}
                description="Accept to join the workspace and start collaborating with your team."
                expirationText={formatInviteExpirationText(notification.inviteExpiresAt)}
                onAccept={onAccept}
                onDecline={onDecline}
                className="py-2"
              />
              {notification.joinCode ? (
                <InviteJoinDetailsCard
                  joinCode={notification.joinCode}
                  inviteUrl={notification.inviteUrl}
                />
              ) : null}
            </div>
          ) : isParentAttachRecipient ? (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-4 py-8">
              <AcceptInvite
                hostName={notification.inviterName ?? "A team member"}
                hostAvatarUrl={notification.inviterAvatarUrl}
                workspaceName={notification.workspaceName ?? "Workspace"}
                description="Accept on behalf of the parent workspace. The initiator must finalize after your confirmation."
                acceptLabel="Accept attach"
                declineLabel="Decline"
                onAccept={onAccept}
                onDecline={onDecline}
                className="py-2"
              />
            </div>
          ) : isRecipientTransfer ? (
            <div className="flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto px-4 py-8">
              <AcceptInvite
                hostName={notification.inviterName ?? "The workspace owner"}
                hostAvatarUrl={notification.inviterAvatarUrl}
                workspaceName={notification.workspaceName ?? "Workspace"}
                description="Accept to become the new owner after the current owner finalizes the transfer."
                acceptLabel="Accept transfer"
                declineLabel="Decline"
                onAccept={onAccept}
                onDecline={onDecline}
                className="py-2"
              />
            </div>
          ) : isParentAttachInitiatorReady && notification.workspaceSlug ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <p className="text-sm leading-relaxed">{notification.body}</p>
              <Button asChild>
                <Link
                  href={workspacePath(
                    notification.workspaceSlug,
                    "/dashboard/settings/workspace",
                  )}
                >
                  Open parent settings to finalize
                </Link>
              </Button>
            </div>
          ) : isOwnerTransferReady && notification.workspaceSlug ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <p className="text-sm leading-relaxed">{notification.body}</p>
              <Button asChild>
                <Link href={workspacePath(notification.workspaceSlug, "/dashboard/team")}>
                  Open team settings to finalize
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Separator />
              <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {notification.body}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground p-8 text-center">Select a notification</div>
      )}
    </div>
  );
}
