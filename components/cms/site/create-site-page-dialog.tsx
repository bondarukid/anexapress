"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { createSitePageAction } from "@/actions/site/site.actions";
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
import { openSitePageEditor } from "@/lib/cms/open-site-page-editor";
import { slugifyTitle } from "@/lib/cms/post-mappers";
import type { WorkspaceSummary } from "@/types/workspace";

type CreateSitePageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  workspaceId: string;
  workspace: WorkspaceSummary;
};

/**
 * Modal to create a draft site page and open the block editor.
 */
export function CreateSitePageDialog({
  open,
  onOpenChange,
  siteId,
  workspaceId,
  workspace,
}: CreateSitePageDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resetForm = useCallback(() => {
    setTitle("");
    setSlug("");
    setSlugTouched(false);
  }, []);

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
      handleOpenChange(false);
      router.refresh();
      openSitePageEditor(workspace, siteId, result.data.pageId);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>
            Create a draft page and open the block editor.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="create-page-title">Page title</Label>
            <Input
              id="create-page-title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="About us"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-page-slug">Slug</Label>
            <Input
              id="create-page-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="about-us"
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
