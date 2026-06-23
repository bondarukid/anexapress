"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { createSitePageAction } from "@/actions/site/site.actions";
import { openSitePageEditor } from "@/lib/cms/open-site-page-editor";
import { slugifyTitle } from "@/lib/cms/post-mappers";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
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
import type { SitePageSummary } from "@/types/site";

type SitePagesTableProps = {
  pages: SitePageSummary[];
  siteId: string;
  workspaceId: string;
  siteName: string;
};

export function SitePagesTable({ pages, siteId, workspaceId, siteName }: SitePagesTableProps) {
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!activeWorkspace) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createSitePageAction({
        siteId,
        workspaceId,
        title,
        slug,
        type: "page",
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Page created");
      openSitePageEditor(activeWorkspace, siteId, result.data.pageId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href={workspacePathFromSummary(activeWorkspace, "/sites")}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Sites
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{siteName} — Pages</h1>
      </div>

      <form onSubmit={handleCreate} className="border-border max-w-lg space-y-3 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">New page title</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugifyTitle(e.target.value));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="page-slug">Slug</Label>
          <Input
            id="page-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
          />
        </div>
        <Button type="submit" disabled={isPending}>
          <Plus className="mr-2 size-4" />
          Create page
        </Button>
      </form>

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
