"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AcceptInvite } from "@/components/dashboard/invites/accept-invite";
import { Button } from "@/components/ui/button";
import { workspaceInvitePath } from "@/lib/routing/workspace-paths";

type InviteLandingCardProps = {
  workspaceName: string;
  workspaceSlug: string;
  joinCode: string;
  isValid: boolean;
  expiresAt: string;
};

export function InviteLandingCard({
  workspaceName,
  workspaceSlug,
  joinCode,
  isValid,
  expiresAt,
}: InviteLandingCardProps) {
  const router = useRouter();
  const inviteReturnPath = workspaceInvitePath(workspaceSlug, joinCode);
  const loginHref = `/login?next=${encodeURIComponent(inviteReturnPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(inviteReturnPath)}`;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <AcceptInvite
        workspaceName={workspaceName}
        description={
          isValid
            ? "Sign in or create an account. After setup you will join this workspace."
            : "This invitation has expired. Ask your team for a new link."
        }
        acceptLabel="Continue"
        declineLabel="Back to home"
        expirationText={isValid ? `Expires ${new Date(expiresAt).toLocaleDateString()}` : "Expired"}
        onAccept={
          isValid
            ? () => {
                router.push(loginHref);
              }
            : undefined
        }
        onDecline={() => router.push("/")}
        className="w-full"
      />
      {isValid ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="flex-1">
            <Link href={loginHref}>Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={signupHref}>Create account</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
