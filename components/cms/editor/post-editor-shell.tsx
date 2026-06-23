"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createSnapshotAction,
  publishPostAction,
  revertVersionAction,
  saveDraftAction,
} from "@/actions/post/post.actions";
import { PostEditor, type PostEditorHandle } from "@/components/cms/editor/post-editor";
import { BlockEditorChrome } from "@/components/cms/editor/block-editor-shell";
import {
  BlockEditorSidebar,
  type EditorSidebarTab,
} from "@/components/cms/editor/block-editor-sidebar";
import { MediaPanel } from "@/components/cms/editor/media-panel";
import { SeoPanel } from "@/components/cms/editor/seo-panel";
import { VersionsPanel } from "@/components/cms/editor/versions-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOptionalSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import type { PostEditorData, PostVersionSummary } from "@/types/post";
import type { TiptapContent } from "@/types/tiptap";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

type PostEditorShellProps = {
  data: PostEditorData;
  versions: PostVersionSummary[];
};

const AUTOSAVE_MS = 4000;

export function PostEditorShell({ data, versions: initialVersions }: PostEditorShellProps) {
  const { post, draftVersion, canPublish } = data;
  const { activeWorkspace } = useWorkspace();
  const siteDashboard = useOptionalSiteDashboard();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [content, setContent] = useState<TiptapContent>(draftVersion.content);
  const [seo, setSeo] = useState<SeoFieldsInput>({
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoCanonical: post.seoCanonical,
    seoKeywords: post.seoKeywords,
    ogImageId: post.ogImageId,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [versions, setVersions] = useState(initialVersions);
  const [sidebarTab, setSidebarTab] = useState<EditorSidebarTab>("content");
  const [editorKey, setEditorKey] = useState(0);
  const [isSaving, startSave] = useTransition();
  const [isPublishing, startPublish] = useTransition();

  const editorRef = useRef<PostEditorHandle>(null);
  const isDirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDraft = useCallback(() => {
    startSave(async () => {
      const result = await saveDraftAction({
        postId: post.id,
        workspaceId: post.workspaceId,
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
  }, [content, post.id, post.workspaceId, seo, title]);

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

  const handlePublish = () => {
    startPublish(async () => {
      await saveDraftAction({
        postId: post.id,
        workspaceId: post.workspaceId,
        title,
        content,
        seo,
      });

      const result = await publishPostAction({
        postId: post.id,
        workspaceId: post.workspaceId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Post published");
    });
  };

  const handleSnapshot = async () => {
    const result = await createSnapshotAction({
      postId: post.id,
      workspaceId: post.workspaceId,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Version saved");
    setVersions((prev) => [
      {
        id: result.data.versionId,
        postId: post.id,
        version: prev.length + 1,
        kind: "snapshot",
        createdAt: new Date().toISOString(),
        title,
      },
      ...prev,
    ]);
  };

  const handleRevert = async (versionId: string) => {
    const result = await revertVersionAction({
      postId: post.id,
      workspaceId: post.workspaceId,
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

  const closeHref = (() => {
    if (siteDashboard?.siteDashboardBase != null) {
      return `${siteDashboard.siteDashboardBase}/content`;
    }
    if (!activeWorkspace) {
      return "/";
    }
    return post.siteId
      ? workspacePathFromSummary(activeWorkspace, `/content?site=${post.siteId}`)
      : workspacePathFromSummary(activeWorkspace, "/content");
  })();

  return (
    <BlockEditorChrome
      title={title.trim() || "Untitled post"}
      status={post.status}
      savedAt={savedAt}
      isSaving={isSaving}
      isPublishing={isPublishing}
      canPublish={canPublish}
      onSaveVersion={() => void handleSnapshot()}
      onPublish={handlePublish}
      closeHref={closeHref}
      editor={
        <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="placeholder:text-muted-foreground/60 w-full border-0 bg-transparent text-3xl font-bold tracking-tight outline-none sm:text-4xl"
          />
          <PostEditor
            key={editorKey}
            ref={editorRef}
            initialContent={content}
            onChange={handleContentChange}
            workspaceId={post.workspaceId}
            siteId={post.siteId}
            onImageRequest={handleImageRequest}
            className="mt-6"
          />
        </div>
      }
      sidebar={
        <BlockEditorSidebar
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          contentTab={
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="editor-slug">URL slug</Label>
                <Input id="editor-slug" value={slug} disabled className="bg-muted/50" />
                <p className="text-muted-foreground text-xs">
                  Slug editing will be available in a future update.
                </p>
              </div>
            </div>
          }
          seoTab={<SeoPanel seo={seo} onChange={handleSeoChange} workspaceId={post.workspaceId} />}
          mediaTab={
            <MediaPanel workspaceId={post.workspaceId} siteId={post.siteId} onInsertImage={handleInsertImage} />
          }
          versionsTab={<VersionsPanel versions={versions} onRevert={handleRevert} />}
        />
      }
    />
  );
}
