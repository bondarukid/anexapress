"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { updateSiteSettingsAction } from "@/actions/site/site.actions";
import { SiteDomainsPanel } from "@/components/cms/site/site-domains-panel";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Site, SiteDomain, SitePageSummary } from "@/types/site";

type SiteSettingsFormProps = {
  site: Site;
  pages: SitePageSummary[];
  domains: SiteDomain[];
  workspaceId: string;
};

export function SiteSettingsForm({ site, pages, domains, workspaceId }: SiteSettingsFormProps) {
  const { activeWorkspace } = useWorkspace();
  const [isPending, startTransition] = useTransition();

  const homeCandidates = pages.filter(
    (p) => p.status === "published" && (p.type === "page" || p.type === "blog_index"),
  );

  const saveHome = (homePageId: string) => {
    startTransition(async () => {
      const result = await updateSiteSettingsAction({
        siteId: site.id,
        workspaceId,
        homePageId: homePageId || null,
      });
      if (!result.success) toast.error(result.error);
      else toast.success("Home page updated");
    });
  };

  const filesHref =
    activeWorkspace ?
      workspacePathFromSummary(activeWorkspace, `/sites/${site.id}/files`)
    : "#";

  return (
    <div className="max-w-lg space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Site settings — {site.name}</h1>

      <div className="space-y-2">
        <Label>Home page</Label>
        <Select
          defaultValue={site.homePageId ?? undefined}
          onValueChange={saveHome}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select home page" />
          </SelectTrigger>
          <SelectContent>
            {homeCandidates.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.title} ({page.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Published pages and blog index can be set as the site home.
        </p>
      </div>

      <SiteDomainsPanel siteId={site.id} workspaceId={workspaceId} domains={domains} />

      <div className="space-y-2">
        <Label>Site files</Label>
        <p className="text-muted-foreground text-xs">
          Upload verification files (app-ads.txt, robots.txt) served from the site root.
        </p>
        <Button asChild variant="outline">
          <Link href={filesHref}>Open file manager</Link>
        </Button>
      </div>
    </div>
  );
}
