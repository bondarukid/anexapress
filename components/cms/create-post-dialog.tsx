"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { createPostAction } from "@/actions/post/post.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openPostEditor } from "@/lib/cms/open-post-editor";
import { slugifyTitle } from "@/lib/cms/post-mappers";
import type { SiteSummary } from "@/types/site";
import type { WorkspaceSummary } from "@/types/workspace";

type CreatePostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceSummary;
  siteId: string;
  sites: SiteSummary[];
};

/**
 * Modal to create a draft post and jump straight into the block editor.
 */
export function CreatePostDialog({
  open,
  onOpenChange,
  workspace,
  siteId,
  sites,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState(siteId);
  const [isPending, startTransition] = useTransition();

  const resetForm = useCallback(() => {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setSelectedSiteId(siteId);
  }, [siteId]);

  useEffect(() => {
    if (!open) return;
    setSelectedSiteId(siteId);
  }, [open, siteId]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyTitle(value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createPostAction({
        workspaceId: workspace.id,
        siteId: selectedSiteId,
        title,
        slug,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Post created");
      handleOpenChange(false);
      openPostEditor(workspace, result.data.postId, { siteId: selectedSiteId });
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>
            Create a draft and open the block editor.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {sites.length > 1 ? (
            <div className="space-y-2">
              <Label htmlFor="create-post-site">Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger id="create-post-site">
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

          <div className="space-y-2">
            <Label htmlFor="create-post-title">Post title</Label>
            <Input
              id="create-post-title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Post title"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-post-slug">Slug</Label>
            <Input
              id="create-post-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="post-slug"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title || !slug}>
              {isPending ? "Creating…" : "Create and open editor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type NewPostButtonProps = Omit<CreatePostDialogProps, "open" | "onOpenChange"> & {
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

/** Opens {@link CreatePostDialog} from a standard trigger button. */
export function NewPostButton({
  variant = "default",
  size,
  className,
  ...dialogProps
}: NewPostButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        New post
      </Button>
      <CreatePostDialog open={open} onOpenChange={setOpen} {...dialogProps} />
    </>
  );
}
