"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createPostAction } from "@/actions/post/post.actions";
import { openPostEditor } from "@/lib/cms/open-post-editor";
import { slugifyTitle } from "@/lib/cms/post-mappers";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SiteSummary } from "@/types/site";
import type { WorkspaceSummary } from "@/types/workspace";

type CreatePostFormProps = {
  workspace: WorkspaceSummary;
  siteId: string;
  sites: SiteSummary[];
  siteDashboardBase?: string;
};

export function CreatePostForm({
  workspace,
  siteId: initialSiteId,
  sites,
  siteDashboardBase,
}: CreatePostFormProps) {
  const router = useRouter();
  const [siteId, setSiteId] = useState(initialSiteId);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createPostAction({
        workspaceId: workspace.id,
        siteId,
        title,
        slug,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Post created");
      openPostEditor(workspace, result.data.postId, { siteId });
      router.push(
        siteDashboardBase
          ? `${siteDashboardBase}/content`
          : workspacePathFromSummary(workspace, `/content?site=${siteId}`),
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
        <p className="text-muted-foreground text-sm">Create a draft and open the block editor.</p>
      </div>

      {sites.length > 1 ? (
        <div className="space-y-2">
          <Label>Site</Label>
          <Select value={siteId} onValueChange={setSiteId}>
            <SelectTrigger>
              <SelectValue />
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

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="post-slug"
          required
        />
      </div>

      <Button type="submit" disabled={isPending || !title || !slug}>
        {isPending ? "Creating…" : "Create and open editor"}
      </Button>
    </form>
  );
}
