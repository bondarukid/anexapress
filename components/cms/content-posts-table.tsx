"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, ImageIcon, Plus } from "lucide-react";

import { ContentPostsPagination } from "@/components/cms/content-posts-pagination";
import { CreatePostDialog } from "@/components/cms/create-post-dialog";
import { useOptionalSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
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
import { getPostStatusLabel, POST_STATUS_META } from "@/lib/cms/post-status";
import { openPostEditor } from "@/lib/cms/open-post-editor";
import { canCreateContent } from "@/lib/team/permissions";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { PaginatedResult, PostDashboardListItem } from "@/types/post";
import type { SiteSummary } from "@/types/site";

type ContentPostsTableProps = {
  posts: PostDashboardListItem[];
  pagination: PaginatedResult<PostDashboardListItem>;
  sites: SiteSummary[];
  selectedSiteId: string | null;
  lockSiteFilter?: boolean;
  contentBasePath: string;
};

export function ContentPostsTable({
  posts,
  pagination,
  sites,
  selectedSiteId,
  lockSiteFilter = false,
  contentBasePath,
}: ContentPostsTableProps) {
  const { activeWorkspace, workspaceAccess } = useWorkspace();
  const siteDashboard = useOptionalSiteDashboard();
  const canCreate = canCreateContent(workspaceAccess);
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (!activeWorkspace) {
    return null;
  }

  const createSiteId = selectedSiteId ?? sites[0]?.id;

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
          {canCreate && createSiteId ? (
            <Button type="button" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              New post
            </Button>
          ) : null}
        </div>
      </div>

      {canCreate && createSiteId ? (
        <CreatePostDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          workspace={activeWorkspace}
          siteId={createSiteId}
          sites={sites}
        />
      ) : null}

      {posts.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
          <FileText className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">No posts yet for this site.</p>
          {canCreate && createSiteId ? (
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(true)}>
              Create your first post
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-[120px]">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, index) => {
                const rowNumber = (pagination.page - 1) * pagination.pageSize + index + 1;

                return (
                <TableRow key={post.id}>
                  <TableCell className="text-muted-foreground text-center text-sm tabular-nums">
                    {rowNumber}
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted relative aspect-video w-24 overflow-hidden rounded-md">
                      {post.coverImageUrl ? (
                        <Image
                          src={post.coverImageUrl}
                          alt={post.title}
                          fill
                          className="object-cover object-center"
                          sizes="96px"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          <ImageIcon className="size-5 opacity-40" aria-hidden />
                          <span className="sr-only">No cover image for {post.title}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-muted-foreground">{post.slug}</TableCell>
                  <TableCell>
                    <Badge variant={POST_STATUS_META[post.status].badgeVariant}>
                      {getPostStatusLabel(post.status)}
                    </Badge>
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
                          siteId: lockSiteFilter ? siteDashboard?.activeSite.id : post.siteId,
                        })
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <ContentPostsPagination
            pagination={pagination}
            contentBasePath={contentBasePath}
            selectedSiteId={selectedSiteId}
            lockSiteFilter={lockSiteFilter}
          />
        </>
      )}
    </div>
  );
}
