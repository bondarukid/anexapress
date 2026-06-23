/**
 * `/dashboard/settings/account`
 *
 * Placeholder route: avatar, legal name display, password / email flows planned here.
 *
 * Compose Shadcn Studio forms from `components/shadcn-studio/blocks/profile-settings/`
 * when persistence + validation are ready.
 */
import PersonalInfo from "@/components/dashboard/settings/account/profile-settings/personal-info";
import { ProfileTimezoneSection } from "@/components/dashboard/settings/account/profile-settings/profile-timezone-section";
import { Separator } from "@/components/ui/separator";
import EmailPass from "@/components/dashboard/settings/account/profile-settings/email-password";
import ConnectAccount from "@/components/dashboard/settings/account/profile-settings/connect-account";
import SocialUrl from "@/components/dashboard/settings/account/profile-settings/social-url";
import DangerZone from "@/components/dashboard/settings/account/profile-settings/danger-zone";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import { getLinkedAccountsSnapshot } from "@/services/linked-accounts";
import { getUserWorkspaces } from "@/services/workspace";
import { Suspense } from "react";

export default async function SettingsAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const workspacesResult = await getUserWorkspaces(user.id);
  const workspaces = workspacesResult.success ? workspacesResult.workspaces : [];
  const isWorkspaceOwner = workspaces.some((workspace) => workspace.roleSlug === "owner");

  const linkedAccounts = await getLinkedAccountsSnapshot();

  if (!linkedAccounts) {
    redirect("/login");
  }

  return (
    <section className="py-3">
      <div className="mx-auto max-w-7xl">
        <PersonalInfo initialUser={user} isWorkspaceOwner={isWorkspaceOwner} />
        <Separator className="my-10" />
        <ProfileTimezoneSection key={`${user.id}-${user.timezone}`} user={user} />
        <Separator className="my-10" />
        <EmailPass initialUser={user} />
        <Separator className="my-10" />
        <Suspense fallback={null}>
          <ConnectAccount initialSnapshot={linkedAccounts} />
        </Suspense>
        <Separator className="my-10" />
        <SocialUrl />
        <Separator className="my-10" />
        <DangerZone />
      </div>
    </section>
  );
}
