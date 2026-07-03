"use client";

import { useMemo } from "react";
import { History, Search, Settings2, SlidersHorizontal } from "lucide-react";

import {
  EditorSettingsDialog,
  type EditorSettingsSection,
} from "@/components/cms/editor/editor-settings-dialog";
import { useEditorChrome } from "@/components/cms/editor/editor-chrome-context";
import { PostSlugField } from "@/components/cms/editor/post-slug-field";
import { PostStatusSelector } from "@/components/cms/editor/post-status-selector";
import { SeoPanel } from "@/components/cms/editor/seo-panel";
import { VersionsPanel } from "@/components/cms/editor/versions-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostStatus, PostVersionSummary } from "@/types/post";
import type { SeoFieldsInput } from "@/schemas/seo.schema";

type PostEditorSettingsDialogProps = {
  title: string;
  onTitleChange: (title: string) => void;
  description: string | null;
  onDescriptionChange: (description: string | null) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  onSlugTouch: () => void;
  status: PostStatus;
  onStatusChange: (status: PostStatus) => void;
  canPublish: boolean;
  hasPublishedVersion: boolean;
  seo: SeoFieldsInput;
  onSeoChange: (seo: SeoFieldsInput) => void;
  workspaceId: string;
  versions: PostVersionSummary[];
  onRevert: (versionId: string) => void;
  onSave: () => void;
  isSaving: boolean;
};

/**
 * Post-specific settings sections inside the macOS-style editor settings dialog.
 */
export function PostEditorSettingsDialog({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  slug,
  onSlugChange,
  onSlugTouch,
  status,
  onStatusChange,
  canPublish,
  hasPublishedVersion,
  seo,
  onSeoChange,
  workspaceId,
  versions,
  onRevert,
  onSave,
  isSaving,
}: PostEditorSettingsDialogProps) {
  const { settingsOpen, setSettingsOpen, settingsSection, setSettingsSection } =
    useEditorChrome();

  const sections = useMemo<EditorSettingsSection[]>(
    () => [
      {
        id: "general",
        label: "General",
        icon: Settings2,
        content: (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="post-settings-title">Post title (on page)</Label>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Shown to readers in the post header. Not the same as SEO title — that lives on the
                SEO tab.
              </p>
              <Input
                id="post-settings-title"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Untitled post"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-settings-description">Post description (on page)</Label>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Text under the title for readers. Not the same as meta description — that lives on the
                SEO tab.
              </p>
              <Textarea
                id="post-settings-description"
                value={description ?? ""}
                onChange={(event) => onDescriptionChange(event.target.value || null)}
                placeholder="Short description for the post header"
                rows={3}
                maxLength={500}
              />
              <p className="text-muted-foreground text-xs">{(description ?? "").length}/500</p>
            </div>

            <PostSlugField
              slug={slug}
              onSlugChange={onSlugChange}
              onSlugTouch={onSlugTouch}
            />

            <PostStatusSelector
              value={status}
              onChange={onStatusChange}
              canPublish={canPublish}
              hasPublishedVersion={hasPublishedVersion}
            />
          </div>
        ),
      },
      {
        id: "seo",
        label: "SEO",
        icon: Search,
        content: (
          <SeoPanel
            seo={seo}
            onChange={onSeoChange}
            workspaceId={workspaceId}
            postDescription={description}
          />
        ),
      },
      {
        id: "versions",
        label: "Versions",
        icon: History,
        content: <VersionsPanel versions={versions} onRevert={onRevert} />,
      },
      {
        id: "advanced",
        label: "Advanced",
        icon: SlidersHorizontal,
        content: (
          <p className="text-muted-foreground text-sm">
            Additional post settings coming soon.
          </p>
        ),
      },
    ],
    [
      canPublish,
      hasPublishedVersion,
      description,
      onDescriptionChange,
      onRevert,
      onSeoChange,
      onSlugChange,
      onSlugTouch,
      onStatusChange,
      onTitleChange,
      seo,
      slug,
      status,
      title,
      versions,
      workspaceId,
    ],
  );

  return (
    <EditorSettingsDialog
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      title="Post settings"
      sections={sections}
      activeSection={settingsSection}
      onSectionChange={setSettingsSection}
      onSave={onSave}
      isSaving={isSaving}
    />
  );
}
