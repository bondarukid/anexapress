import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { PanelsTopLeft, UsersIcon } from "lucide-react";

import { getCurrentUser } from "@/services/user";
import {
  resolveWorkspaceFromRoute,
  workspacePathFromSummary,
} from "@/lib/dashboard/workspace-route";
import { Button } from "@/components/ui/button";

type DashboardHomePageProps = {
  params: Promise<{ workspaceSlug: string; childSlug?: string }>;
};

/**
 * Dashboard home (`/dashboard`). Shell (sidebar/header) lives in `layout.tsx`.
 */
export default async function DashboardHomePage({ params }: DashboardHomePageProps) {
  const routeParams = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await resolveWorkspaceFromRoute(routeParams, user.id);
  if (!workspace) {
    notFound();
  }

  const settingsBase = workspacePathFromSummary(workspace, "/settings");
  const teamUrl = workspacePathFromSummary(workspace, "/team");

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-foreground text-2xl font-semibold tracking-tight">
          Welcome{workspace.name ? `, ${workspace.name}` : ""}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Track emissions, manage your team, and configure workspace settings from here.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <UsersIcon className="text-muted-foreground size-5" />
            <h2 className="font-medium">Team</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Invite members, assign roles, and manage access.
          </p>
          <Button variant="outline" className="mt-auto w-fit" asChild>
            <Link href={teamUrl}>Open team</Link>
          </Button>
        </div>

        <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <PanelsTopLeft className="text-muted-foreground size-5" />
            <h2 className="font-medium">Workspace settings</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Update workspace name, branding, timezone, and other general settings.
          </p>
          <Button variant="outline" className="mt-auto w-fit" asChild>
            <Link href={`${settingsBase}/workspace`}>Open settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
