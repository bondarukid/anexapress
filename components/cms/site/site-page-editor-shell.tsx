"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createSitePageSnapshotAction,
  publishSitePageAction,
  revertSitePageVersionAction,
  saveSitePageDraftAction,
} from "@/actions/site/site.actions";
import { BlockEditorChrome } from "@/components/cms/editor/block-editor-shell";
import { BlockEditorSidebar } from "@/components/cms/editor/block-editor-sidebar";
import { PostEditor } from "@/components/cms/editor/post-editor";
import { MediaPanel } from "@/components/cms/editor/media-panel";
import { SeoPanel } from "@/components/cms/editor/seo-panel";
import { VersionsPanel } from "@/components/cms/editor/versions-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SitePageEditorData, SitePageVersionSummary } from "@/types/site";
import type { TiptapContent } from "@/types/tiptap";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

type SitePageEditorShellProps = {
  data: SitePageEditorData;
  versions: SitePageVersionSummary[];
  workspaceId: string;
};

const AUTOSAVE_MS = 4000;

export function SitePageEditorShell({ data, versions: initialVersions, workspaceId }: SitePageEditorShellProps) {
  const { page, draftVersion, site, canPublish } = data;
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState<TiptapContent>(draftVersion.content);
  const [seo, setSeo] = useState<SeoFieldsInput>({
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    seoCanonical: page.seoCanonical,
    seoKeywords: page.seoKeywords,
    ogImageId: page.ogImageId,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [versions] = useState(initialVersions);
  const [isSaving, startSave] = useTransition();
  const [isPublishing, startPublish] = useTransition();

  const persistDraft = useCallback(() => {
    startSave(async () => {
      const result = await saveSitePageDraftAction({
        pageId: page.id,
        siteId: site.id,
        workspaceId,
        title,
        content,
        seo,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSavedAt(result.data.savedAt);
    });
  }, [content, page.id, seo, site.id, title, workspaceId]);

  useEffect(() => {
    const timer = setTimeout(() => persistDraft(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [content, title, seo, persistDraft]);

  const handlePublish = () => {
    startPublish(async () => {
      await saveSitePageDraftAction({
        pageId: page.id,
        siteId: site.id,
        workspaceId,
        title,
        content,
        seo,
      });

      const result = await publishSitePageAction({
        pageId: page.id,
        siteId: site.id,
        workspaceId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Page published");
    });
  };

  const handleInsertImage = (media: import("@/types/media").MediaFile) => {
    setContent((prev) => ({
      ...prev,
      content: [
        ...(prev.content ?? []),
        {
          type: "image",
          attrs: {
            mediaId: media.id,
            src: media.publicUrl,
            alt: media.alt ?? "",
          },
        },
      ],
    }));
  };

  return (
    <BlockEditorChrome
      title={`Page editor — ${site.name}`}
      status={page.status}
      savedAt={savedAt}
      isSaving={isSaving}
      isPublishing={isPublishing}
      canPublish={canPublish && page.type !== "blog_index"}
      onSaveVersion={() =>
        void createSitePageSnapshotAction({
          pageId: page.id,
          siteId: site.id,
          workspaceId,
        }).then((r) => {
          if (r.success) toast.success("Version saved");
          else toast.error(r.error);
        })
      }
      onPublish={handlePublish}
      editor={<PostEditor initialContent={content} onChange={setContent} />}
      sidebar={
        <BlockEditorSidebar
          contentTab={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-title">Title</Label>
                <Input id="page-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <p className="text-muted-foreground text-xs">Slug: {page.slug}</p>
            </div>
          }
          seoTab={<SeoPanel seo={seo} onChange={setSeo} workspaceId={workspaceId} />}
          mediaTab={<MediaPanel workspaceId={workspaceId} siteId={site.id} onInsertImage={handleInsertImage} />}
          versionsTab={
            <VersionsPanel
              versions={versions.map((v) => ({
                id: v.id,
                postId: v.pageId,
                version: v.version,
                kind: v.kind,
                createdAt: v.createdAt,
                title: v.title,
              }))}
              onRevert={(versionId) =>
                void revertSitePageVersionAction({
                  pageId: page.id,
                  siteId: site.id,
                  workspaceId,
                  versionId,
                }).then((r) => {
                  if (r.success) window.location.reload();
                  else toast.error(r.error);
                })
              }
            />
          }
        />
      }
    />
  );
}
