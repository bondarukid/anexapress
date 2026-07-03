"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createSnapshotAction,
  publishPostAction,
  revertVersionAction,
  saveDraftAction,
} from "@/actions/post/post.actions";
import { PostEditor, type PostEditorHandle } from "@/components/cms/editor/post-editor";
import { PostEditorHeader } from "@/components/cms/editor/post-editor-header";
import { BlockEditorWorkspace } from "@/components/cms/editor/block-editor-shell";
import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import { PostEditorSettingsDialog } from "@/components/cms/editor/post-editor-settings-dialog";
import { MediaPanel } from "@/components/cms/editor/media-panel";
import { YoutubeEmbedDialog } from "@/components/cms/editor/youtube-embed-dialog";
import { useOptionalSiteDashboard } from "@/components/providers/site-dashboard-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { slugifyTitle } from "@/lib/cms/post-mappers";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PostEditorData, PostStatus, PostVersionSummary } from "@/types/post";
import type { MediaFile } from "@/types/media";
import type { TiptapContent } from "@/types/tiptap";
import type { PostDisplayFieldsInput } from "@/schemas/post-display.schema";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

type PostEditorShellProps = {
  data: PostEditorData;
  versions: PostVersionSummary[];
  userDisplayName: string;
  userAvatarUrl: string | null;
};

const AUTOSAVE_MS = 4000;

export function PostEditorShell({
  data,
  versions: initialVersions,
  userDisplayName,
  userAvatarUrl,
}: PostEditorShellProps) {
  const { post, draftVersion, canPublish, authorAvatarUrl: initialAuthorAvatarUrl, hasUnpublishedChanges: initialHasUnpublishedChanges } = data;
  const { activeWorkspace } = useWorkspace();
  const siteDashboard = useOptionalSiteDashboard();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [content, setContent] = useState<TiptapContent>(draftVersion.content);
  const [seo, setSeo] = useState<SeoFieldsInput>({
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoCanonical: post.seoCanonical,
    seoKeywords: post.seoKeywords,
    ogImageId: post.ogImageId,
    usePostDescriptionForSeo: post.usePostDescriptionForSeo,
  });
  const [display, setDisplay] = useState<PostDisplayFieldsInput>({
    description: post.description,
    authorName: post.authorName ?? userDisplayName,
    authorAvatarId: post.authorAvatarId,
  });
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(initialAuthorAvatarUrl);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(initialHasUnpublishedChanges);
  const [versions, setVersions] = useState(initialVersions);
  const [editorKey, setEditorKey] = useState(0);
  const [isSaving, startSave] = useTransition();
  const [isPublishing, startPublish] = useTransition();

  const editorRef = useRef<PostEditorHandle>(null);
  const { setChrome, setSettingsOpen } = useEditorChrome();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const isDirtyRef = useRef(false);
  const slugTouchedRef = useRef(slug !== slugifyTitle(post.title));
  const hasPublishedVersion = Boolean(post.publishedVersionId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDraft = useCallback(() => {
    startSave(async () => {
      const result = await saveDraftAction({
        postId: post.id,
        workspaceId: post.workspaceId,
        title,
        content,
        seo,
        display,
        slug,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSavedAt(result.data.savedAt);
      setHasUnpublishedChanges(result.data.hasUnpublishedChanges);
      isDirtyRef.current = false;
    });
  }, [content, display, post.id, post.workspaceId, seo, slug, title]);

  const handleSettingsSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    startSave(async () => {
      const result = await saveDraftAction({
        postId: post.id,
        workspaceId: post.workspaceId,
        title,
        content,
        seo,
        display,
        ...(hasPublishedVersion
          ? status === "archived"
            ? { status: "archived" as const }
            : {}
          : { status }),
        slug,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSavedAt(result.data.savedAt);
      setStatus(result.data.status);
      setSlug(result.data.slug);
      setHasUnpublishedChanges(result.data.hasUnpublishedChanges);
      isDirtyRef.current = false;
      toast.success(hasPublishedVersion ? "Draft saved" : "Post saved");
      setSettingsOpen(false);
    });
  }, [content, display, hasPublishedVersion, post.id, post.workspaceId, seo, setSettingsOpen, slug, status, title]);

  useEffect(() => {
    if (!isDirtyRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      persistDraft();
    }, AUTOSAVE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, title, seo, display, slug, persistDraft]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
    if (hasPublishedVersion) {
      setHasUnpublishedChanges(true);
    }
  }, [hasPublishedVersion]);

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
      if (!slugTouchedRef.current) {
        setSlug(slugifyTitle(value));
      }
    },
    [markDirty],
  );

  const handleSlugChange = useCallback(
    (value: string) => {
      markDirty();
      setSlug(value);
    },
    [markDirty],
  );

  const handleSlugTouch = useCallback(() => {
    slugTouchedRef.current = true;
  }, []);

  const handleSeoChange = useCallback(
    (nextSeo: SeoFieldsInput) => {
      markDirty();
      setSeo(nextSeo);
    },
    [markDirty],
  );

  const handleDisplayChange = useCallback(
    (nextDisplay: PostDisplayFieldsInput) => {
      markDirty();
      setDisplay(nextDisplay);
    },
    [markDirty],
  );

  const handleStatusChange = useCallback(
    (nextStatus: PostStatus) => {
      markDirty();
      setStatus(nextStatus);
    },
    [markDirty],
  );

  const handlePublish = useCallback(() => {
    startPublish(async () => {
      await saveDraftAction({
        postId: post.id,
        workspaceId: post.workspaceId,
        title,
        content,
        seo,
        display,
        slug,
      });

      const result = await publishPostAction({
        postId: post.id,
        workspaceId: post.workspaceId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setStatus("published");
      setSavedAt(new Date().toISOString());
      setHasUnpublishedChanges(false);
      isDirtyRef.current = false;
      toast.success("Post published");
    });
  }, [content, display, post.id, post.workspaceId, seo, slug, startPublish, title]);

  const handleSnapshot = useCallback(async () => {
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
  }, [post.id, post.workspaceId, title]);

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
    setDisplay({
      ...result.data.display,
      authorName: result.data.display.authorName ?? userDisplayName,
    });
    setAuthorAvatarUrl(result.data.authorAvatarUrl);
    setEditorKey((key) => key + 1);
    isDirtyRef.current = false;
    const revertedVersion = versions.find((version) => version.id === versionId);
    setHasUnpublishedChanges(
      hasPublishedVersion && revertedVersion?.kind !== "published",
    );
    toast.success("Draft restored from version");
  };

  const handleInsertImage = (media: MediaFile) => {
    markDirty();
    editorRef.current?.insertImage({
      mediaId: media.id,
      src: media.publicUrl,
      alt: media.alt ?? "",
    });
    setImagePickerOpen(false);
  };

  const handleImageRequest = useCallback(() => {
    setImagePickerOpen(true);
  }, []);

  const handleYoutubeRequest = useCallback(() => {
    setYoutubeDialogOpen(true);
  }, []);

  const handleInsertYoutube = useCallback((src: string) => {
    markDirty();
    editorRef.current?.insertYoutube(src);
    setYoutubeDialogOpen(false);
  }, [markDirty]);

  const closeHref = useMemo(() => {
    if (siteDashboard?.siteDashboardBase != null) {
      return `${siteDashboard.siteDashboardBase}/content`;
    }
    if (!activeWorkspace) {
      return "/";
    }
    return post.siteId
      ? workspacePathFromSummary(activeWorkspace, `/content?site=${post.siteId}`)
      : workspacePathFromSummary(activeWorkspace, "/content");
  }, [activeWorkspace, post.siteId, siteDashboard?.siteDashboardBase]);

  useEffect(() => {
    setChrome({
      title: title.trim() || "Untitled post",
      status,
      savedAt,
      isSaving,
      isPublishing,
      canPublish,
      hasUnpublishedChanges,
      closeHref,
      closeLabel: "Back to posts",
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
    hasUnpublishedChanges,
    isPublishing,
    isSaving,
    savedAt,
    setChrome,
    status,
    title,
  ]);

  return (
    <>
      <PostEditorSettingsDialog
        title={title}
        onTitleChange={handleTitleChange}
        description={display.description ?? null}
        onDescriptionChange={(value) => handleDisplayChange({ ...display, description: value })}
        slug={slug}
        onSlugChange={handleSlugChange}
        onSlugTouch={handleSlugTouch}
        status={status}
        onStatusChange={handleStatusChange}
        canPublish={canPublish}
        hasPublishedVersion={hasPublishedVersion}
        seo={seo}
        onSeoChange={handleSeoChange}
        workspaceId={post.workspaceId}
        versions={versions}
        onRevert={handleRevert}
        onSave={handleSettingsSave}
        isSaving={isSaving}
      />

      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription className="sr-only">
            Choose an image from the media library to insert into the post.
          </DialogDescription>
          <MediaPanel
            workspaceId={post.workspaceId}
            siteId={post.siteId}
            onInsertImage={handleInsertImage}
          />
        </DialogContent>
      </Dialog>

      <YoutubeEmbedDialog
        open={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onInsert={handleInsertYoutube}
      />

      <BlockEditorWorkspace
        documentLabel="Post"
        editor={
          <div className="mx-auto max-w-3xl px-6 py-12">
            <PostEditorHeader
              title={title}
              onTitleChange={handleTitleChange}
              publishedAt={post.publishedAt}
              display={display}
              authorAvatarUrl={authorAvatarUrl}
              userDisplayName={userDisplayName}
              userAvatarUrl={userAvatarUrl}
              workspaceId={post.workspaceId}
              onDisplayChange={handleDisplayChange}
              onAuthorAvatarUrlChange={setAuthorAvatarUrl}
            />
            <PostEditor
              key={editorKey}
              ref={editorRef}
              initialContent={content}
              onChange={handleContentChange}
              workspaceId={post.workspaceId}
              siteId={post.siteId}
              onImageRequest={handleImageRequest}
              onYoutubeRequest={handleYoutubeRequest}
            />
          </div>
        }
      />
    </>
  );
}
