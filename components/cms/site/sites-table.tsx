"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Globe, Plus } from "lucide-react";

import { createSiteAction } from "@/actions/site/site.actions";
import { ENABLE_MULTI_SITE } from "@/lib/config/feature-flags";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { canCreateContent } from "@/lib/team/permissions";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SiteSummary } from "@/types/site";

type SitesTableProps = {
  sites: SiteSummary[];
  workspaceId: string;
};

export function SitesTable({ sites, workspaceId }: SitesTableProps) {
  const { activeWorkspace, workspaceAccess } = useWorkspace();
  const canCreate = canCreateContent(workspaceAccess) && ENABLE_MULTI_SITE;
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!activeWorkspace) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createSiteAction({
        workspaceId,
        name,
        slug,
        withBlog: true,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Site created");
      setShowForm(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sites</h1>
          <p className="text-muted-foreground text-sm">Manage workspace websites and landing pages.</p>
        </div>
        {canCreate ? (
          <Button type="button" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 size-4" />
            New site
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="border-border max-w-md space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Name</Label>
            <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-slug">Slug</Label>
            <Input id="site-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <Button type="submit" disabled={isPending}>Create site</Button>
        </form>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell className="font-medium">{site.name}</TableCell>
              <TableCell className="text-muted-foreground">{site.slug}</TableCell>
              <TableCell>
                {site.isDefault ? <Badge>Default</Badge> : null}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={workspacePathFromSummary(activeWorkspace, `/sites/${site.id}/pages`)}>
                    Pages
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={workspacePathFromSummary(activeWorkspace, `/sites/${site.id}/layout`)}>
                    Layout
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={workspacePathFromSummary(activeWorkspace, `/sites/${site.id}/settings`)}>
                    Settings
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={`/${activeWorkspace.isChild && activeWorkspace.parentSlug ? `${activeWorkspace.parentSlug}/${activeWorkspace.slug}` : activeWorkspace.slug}/${site.slug}`}
                    target="_blank"
                  >
                    <Globe className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
