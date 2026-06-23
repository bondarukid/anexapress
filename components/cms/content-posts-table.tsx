"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus } from "lucide-react";

import { openPostEditor } from "@/lib/cms/open-post-editor";
import { canCreateContent } from "@/lib/team/permissions";
import { useOptionalSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkspace } from "@/components/providers/workspace-provider";
import type { PostSummary } from "@/types/post";
import type { SiteSummary } from "@/types/site";

type ContentPostsTableProps = {
  posts: PostSummary[];
  sites: SiteSummary[];
  selectedSiteId: string | null;
  lockSiteFilter?: boolean;
};

const statusVariant: Record<PostSummary["status"], "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
};

export function ContentPostsTable({
  posts,
  sites,
  selectedSiteId,
  lockSiteFilter = false,
}: ContentPostsTableProps) {
  const { activeWorkspace, workspaceAccess } = useWorkspace();
  const siteDashboard = useOptionalSiteDashboard();
  const canCreate = canCreateContent(workspaceAccess);
  const router = useRouter();

  if (!activeWorkspace) {
    return null;
  }

  const siteQuery = selectedSiteId ? `?site=${selectedSiteId}` : "";
  const newPostHref =
    lockSiteFilter && siteDashboard
      ? `${siteDashboard.siteDashboardBase}/content/new`
      : workspacePathFromSummary(activeWorkspace, `/content/new${siteQuery}`);

  const handleSiteChange = (siteId: string) => {
    if (lockSiteFilter) return;
    router.push(workspacePathFromSummary(activeWorkspace, `/content?site=${siteId}`));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog posts</h1>
          <p className="text-muted-foreground text-sm">Manage posts for a workspace site.</p>
        </div>
        <div className="flex items-end gap-3">
          {!lockSiteFilter && sites.length > 1 ? (
            <div className="space-y-1">
              <Label className="text-xs">Site</Label>
              <Select value={selectedSiteId ?? undefined} onValueChange={handleSiteChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {canCreate ? (
            <Button asChild>
              <Link href={newPostHref}>
                <Plus className="mr-2 size-4" />
                New post
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
          <FileText className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">No posts yet for this site.</p>
          {canCreate ? (
            <Button asChild variant="outline">
              <Link href={newPostHref}>Create your first post</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[post.status]}>{post.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openPostEditor(activeWorkspace, post.id, {
                        siteDashboardBase:
                          lockSiteFilter ? siteDashboard?.siteDashboardBase : undefined,
                      })
                    }
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
