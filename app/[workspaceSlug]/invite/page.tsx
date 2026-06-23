import { InviteAutoJoin } from "@/components/dashboard/invites/invite-auto-join";
import { InviteLandingCard } from "@/components/dashboard/invites/invite-landing-card";
import { normalizeJoinCode } from "@/lib/invites/join-code";
import { getInviteLandingContext } from "@/services/invite";
import { getCurrentUser } from "@/services/user";

type InvitePageProps = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ code?: string }>;
};

export default async function WorkspaceInvitePage({ params, searchParams }: InvitePageProps) {
  const { workspaceSlug } = await params;
  const { code: rawCode } = await searchParams;
  const joinCode = rawCode ? normalizeJoinCode(rawCode) : "";

  if (joinCode.length !== 8) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-muted-foreground text-center text-sm">Invalid or missing invite code.</p>
      </main>
    );
  }

  const context = await getInviteLandingContext(joinCode);

  if (!context || context.workspaceSlug !== workspaceSlug) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-muted-foreground text-center text-sm">
          This invite link is invalid or does not match this workspace.
        </p>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    if (!context.isValid) {
      return (
        <main className="bg-muted/30 flex min-h-svh flex-col items-center justify-center p-6">
          <InviteLandingCard
            workspaceName={context.workspaceName}
            workspaceSlug={workspaceSlug}
            joinCode={joinCode}
            isValid={false}
            expiresAt={context.expiresAt}
          />
        </main>
      );
    }

    return (
      <InviteAutoJoin
        joinCode={joinCode}
        workspaceSlug={workspaceSlug}
        workspaceName={context.workspaceName}
      />
    );
  }

  return (
    <main className="bg-muted/30 flex min-h-svh flex-col items-center justify-center p-6">
      <InviteLandingCard
        workspaceName={context.workspaceName}
        workspaceSlug={workspaceSlug}
        joinCode={joinCode}
        isValid={context.isValid}
        expiresAt={context.expiresAt}
      />
    </main>
  );
}
