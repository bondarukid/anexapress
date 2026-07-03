"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CreateSitePageDialog } from "@/components/cms/site/create-site-page-dialog";
import { openSitePageEditor } from "@/lib/cms/open-site-page-editor";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SitePageSummary } from "@/types/site";

type SitePagesTableProps = {
  pages: SitePageSummary[];
  siteId: string;
  workspaceId: string;
  siteName: string;
};

export function SitePagesTable({ pages, siteId, workspaceId, siteName }: SitePagesTableProps) {
  const { activeWorkspace } = useWorkspace();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (!activeWorkspace) return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{siteName} — Pages</h1>
          <p className="text-muted-foreground text-sm">Manage pages for this site.</p>
        </div>
        <Button type="button" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          New page
        </Button>
      </div>

      <CreateSitePageDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        siteId={siteId}
        workspaceId={workspaceId}
        workspace={activeWorkspace}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>{page.title}</TableCell>
              <TableCell className="text-muted-foreground">{page.slug}</TableCell>
              <TableCell>{page.type}</TableCell>
              <TableCell>
                <Badge variant={page.status === "published" ? "default" : "secondary"}>
                  {page.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {page.type !== "blog_index" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openSitePageEditor(activeWorkspace, siteId, page.id)}
                  >
                    Edit
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">Blog index</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
