"use client";

import * as React from "react";
import type { FormEvent } from "react";
import { Info, Link, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { InviteCreatedSuccess } from "@/components/dashboard/invites/invite-created-success";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInviteDialog } from "@/hooks/use-invite-dialog";
import { cn } from "@/lib/utils";
import type { TeamRoleOption } from "@/types/team";

type InviteMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceSlug: string;
  assignableRoles: TeamRoleOption[];
  onSuccess?: () => void;
};

const EXPIRY_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

const footerClassName =
  "mx-0 mb-0 gap-2 rounded-b-xl border-t bg-muted/40 px-6 pt-4 pb-6 sm:justify-end";

const inviteHintClassName = "mt-auto flex shrink-0 items-start gap-2.5 px-1 py-0";

export function InviteMemberDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceSlug,
  assignableRoles,
  onSuccess,
}: InviteMemberDialogProps) {
  const [tab, setTab] = React.useState("email");
  const [email, setEmail] = React.useState("");
  const [roleId, setRoleId] = React.useState("");
  const [linkRoleId, setLinkRoleId] = React.useState("");
  const [expiresInDays, setExpiresInDays] = React.useState("14");

  const toast = useToast();
  const { createdPayload, isSubmitting, reset, inviteByEmail, createJoinLink } = useInviteDialog({
    workspaceId,
    workspaceSlug,
  });

  const resetForm = React.useCallback(() => {
    setEmail("");
    setRoleId("");
    setLinkRoleId("");
    setExpiresInDays("14");
    setTab("email");
    reset();
  }, [reset]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) resetForm();
  }

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !roleId) return;

    const result = await inviteByEmail(email.trim(), roleId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Invitation created");
    onSuccess?.();
  }

  async function handleLinkSubmit(event: FormEvent) {
    event.preventDefault();
    if (!linkRoleId) return;

    const result = await createJoinLink(linkRoleId, Number.parseInt(expiresInDays, 10));
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Join link created");
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger type="button" className="sr-only" aria-hidden tabIndex={-1} />
      <DialogContent className="flex max-h-[min(640px,calc(100vh-2rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {createdPayload ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="bg-muted/20 shrink-0 border-b px-6 py-5 text-left">
              <DialogTitle className="sr-only">Invitation created</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <InviteCreatedSuccess
                payload={createdPayload}
                title={tab === "link" ? "Join link is ready" : "Invitation is ready"}
                description={
                  tab === "link"
                    ? "Share the code or link with anyone who should join before it expires."
                    : "They will get an in-app notification. You can also share the code or link directly."
                }
              />
            </div>
            <DialogFooter className={footerClassName}>
              <Button type="button" variant="outline" onClick={resetForm}>
                Invite another
              </Button>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="bg-muted/20 shrink-0 space-y-3 border-b px-6 py-5 text-left">
              <div className="space-y-1">
                <DialogTitle className="text-lg">Invite teammates</DialogTitle>
                <DialogDescription>
                  Send a personal invite by email, or create a shareable join link for your
                  workspace.
                </DialogDescription>
              </div>
              <TabsList className="grid h-10 w-full grid-cols-2">
                <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
                  <Mail className="size-4" />
                  By email
                </TabsTrigger>
                <TabsTrigger value="link" className="gap-1.5 text-xs sm:text-sm">
                  <Link className="size-4" />
                  Join link
                </TabsTrigger>
              </TabsList>
            </DialogHeader>

            <TabsContent
              value="email"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <form onSubmit={handleEmailSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email" className="gap-1">
                        Email
                        <span className="text-destructive">*</span>
                      </Label>
                      <InputGroup>
                        <InputGroupInput
                          id="invite-email"
                          type="email"
                          placeholder="colleague@company.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                          <Mail className="size-4" aria-hidden />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={roleId || undefined} onValueChange={setRoleId}>
                        <SelectTrigger id="invite-role" className="w-full">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className={cn(inviteHintClassName, "pt-4")}>
                    <Info className="text-primary mt-0.5 size-4 shrink-0" />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      If they already have an account, they will see the invite in notifications and
                      can use the join code from there.
                    </p>
                  </div>
                </div>
                <DialogFooter className={footerClassName}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!email.trim() || !roleId || isSubmitting}>
                    {isSubmitting ? "Creating…" : "Create invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent
              value="link"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <form onSubmit={handleLinkSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="link-role">Role for new members</Label>
                      <Select value={linkRoleId || undefined} onValueChange={setLinkRoleId}>
                        <SelectTrigger id="link-role" className="w-full">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-expiry">Link expires in</Label>
                      <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                        <SelectTrigger id="link-expiry" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPIRY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className={cn(inviteHintClassName, "pt-4")}>
                    <Link className="text-primary mt-0.5 size-4 shrink-0" />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Anyone with the code or link can join with the role you choose, until the link
                      expires.
                    </p>
                  </div>
                </div>
                <DialogFooter className={footerClassName}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!linkRoleId || isSubmitting}>
                    {isSubmitting ? "Creating…" : "Create join link"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
