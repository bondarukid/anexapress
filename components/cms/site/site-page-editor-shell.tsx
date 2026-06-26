"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createSitePageSnapshotAction,
  publishSitePageAction,
  revertSitePageVersionAction,
  saveSitePageDraftAction,
} from "@/actions/site/site.actions";
import { BlockEditorWorkspace } from "@/components/cms/editor/block-editor-shell";
import {
  BlockEditorSidebar,
  type EditorSidebarTab,
} from "@/components/cms/editor/block-editor-sidebar";
import { EditorDocumentTitleField } from "@/components/cms/editor/editor-document-title-field";
import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import { PostEditor, type PostEditorHandle } from "@/components/cms/editor/post-editor";
import { MediaPanel } from "@/components/cms/editor/media-panel";
import { SeoPanel } from "@/components/cms/editor/seo-panel";
import { VersionsPanel } from "@/components/cms/editor/versions-panel";
import { Badge } from "@/components/ui/badge";
import { useOptionalSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
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
  const { activeWorkspace } = useWorkspace();
  const siteDashboard = useOptionalSiteDashboard();
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
  const [versions, setVersions] = useState(initialVersions);
  const [sidebarTab, setSidebarTab] = useState<EditorSidebarTab>("content");
  const [editorKey, setEditorKey] = useState(0);
  const [isSaving, startSave] = useTransition();
  const [isPublishing, startPublish] = useTransition();

  const editorRef = useRef<PostEditorHandle>(null);
  const { setChrome } = useEditorChrome();
  const isDirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      isDirtyRef.current = false;
    });
  }, [content, page.id, seo, site.id, title, workspaceId]);

  useEffect(() => {
    if (!isDirtyRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistDraft();
    }, AUTOSAVE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, title, seo, persistDraft]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const handleContentChange = useCallback(
    (nextContent: TiptapContent) => {
      markDirty();
      setContent(nextContent);
    },
    [markDirty],
  );

  const handleTitleChange = useCallback(
    (value: string) => {
      markDirty();
      setTitle(value);
    },
    [markDirty],
  );

  const handleSeoChange = useCallback(
    (nextSeo: SeoFieldsInput) => {
      markDirty();
      setSeo(nextSeo);
    },
    [markDirty],
  );

  const handlePublish = useCallback(() => {
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
  }, [content, page.id, seo, site.id, startPublish, title, workspaceId]);

  const handleSnapshot = useCallback(async () => {
    const result = await createSitePageSnapshotAction({
      pageId: page.id,
      siteId: site.id,
      workspaceId,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Version saved");
    setVersions((prev) => [
      {
        id: result.data.versionId,
        pageId: page.id,
        version: prev.length + 1,
        kind: "snapshot",
        createdAt: new Date().toISOString(),
        title,
      },
      ...prev,
    ]);
  }, [page.id, site.id, title, workspaceId]);

  const handleRevert = async (versionId: string) => {
    const result = await revertSitePageVersionAction({
      pageId: page.id,
      siteId: site.id,
      workspaceId,
      versionId,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setTitle(result.data.title);
    setContent(result.data.content);
    setSeo(result.data.seo);
    setEditorKey((key) => key + 1);
    isDirtyRef.current = false;
    toast.success("Draft restored from version");
  };

  const handleInsertImage = (media: import("@/types/media").MediaFile) => {
    markDirty();
    editorRef.current?.insertImage({
      mediaId: media.id,
      src: media.publicUrl,
      alt: media.alt ?? "",
    });
  };

  const handleImageRequest = useCallback(() => {
    setSidebarTab("media");
  }, []);

  const closeHref = useMemo(() => {
    if (siteDashboard?.siteDashboardBase != null) {
      return `${siteDashboard.siteDashboardBase}/pages`;
    }
    if (!activeWorkspace) {
      return "/";
    }
    return workspacePathFromSummary(activeWorkspace, `/sites/${site.id}/pages`);
  }, [activeWorkspace, site.id, siteDashboard?.siteDashboardBase]);

  useEffect(() => {
    setChrome({
      title: `${site.name} · ${title.trim() || "Untitled page"}`,
      status: page.status,
      savedAt,
      isSaving,
      isPublishing,
      canPublish: canPublish && page.type !== "blog_index",
      closeHref,
      closeLabel: "Back to pages",
      onSaveVersion: () => {
        void handleSnapshot();
      },
      onPublish: handlePublish,
    });
  }, [
    canPublish,
    closeHref,
    handlePublish,
    handleSnapshot,
    isPublishing,
    isSaving,
    page.status,
    page.type,
    savedAt,
    setChrome,
    site.name,
    title,
  ]);

  return (
    <BlockEditorWorkspace
      documentLabel="Page"
      documentSettings={
        <BlockEditorSidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          contentTab={
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">Page URL</p>
                <p className="font-mono text-sm">/{page.slug}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">Type</p>
                <Badge variant="secondary">{page.type}</Badge>
              </div>
            </div>
          }
          seoTab={<SeoPanel seo={seo} onChange={handleSeoChange} workspaceId={workspaceId} />}
          mediaTab={<MediaPanel workspaceId={workspaceId} siteId={site.id} onInsertImage={handleInsertImage} />}
          versionsTab={
            <VersionsPanel
              versions={versions.map((version) => ({
                id: version.id,
                postId: version.pageId,
                version: version.version,
                kind: version.kind,
                createdAt: version.createdAt,
                title: version.title,
              }))}
              onRevert={handleRevert}
            />
          }
        />
      }
      editor={
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
          <EditorDocumentTitleField
            value={title}
            onChange={handleTitleChange}
            placeholder="Page title"
          />
          <PostEditor
            key={editorKey}
            ref={editorRef}
            initialContent={content}
            onChange={handleContentChange}
            workspaceId={workspaceId}
            siteId={site.id}
            onImageRequest={handleImageRequest}
            className="mt-6"
          />
        </div>
      }
    />
  );
}
