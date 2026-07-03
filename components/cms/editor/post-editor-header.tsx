"use client";

import { format } from "date-fns";

import { PostAuthorNameSelector } from "@/components/cms/editor/post-author-name-selector";
import { useEditorInspector } from "@/components/cms/editor/editor-inspector-context";
import { MediaPicker } from "@/components/cms/media/media-picker";
import {
  POST_HEADER_AUTHOR_NAME_CLASS,
  POST_HEADER_AUTHOR_ROW_CLASS,
  PostHeader,
  PostHeaderAvatar,
} from "@/components/cms/post/post-header";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isPostAuthorProfile, resolvePostAuthorAvatarUrl, resolvePostAuthorName } from "@/lib/cms/post-author";
import { cn } from "@/lib/utils";
import type { PostDisplayFieldsInput } from "@/schemas/post-display.schema";

type PostEditorHeaderProps = {
  title: string;
  onTitleChange: (value: string) => void;
  publishedAt: string | null;
  display: PostDisplayFieldsInput;
  authorAvatarUrl: string | null;
  userDisplayName: string;
  userAvatarUrl: string | null;
  workspaceId: string;
  onDisplayChange: (display: PostDisplayFieldsInput) => void;
  onAuthorAvatarUrlChange: (url: string | null) => void;
};

/**
 * Post header in the editor canvas — same layout as the public blog page, inline-editable.
 */
export function PostEditorHeader({
  title,
  onTitleChange,
  publishedAt,
  display,
  authorAvatarUrl,
  userDisplayName,
  userAvatarUrl,
  workspaceId,
  onDisplayChange,
  onAuthorAvatarUrlChange,
}: PostEditorHeaderProps) {
  const { clearSelectedBlock } = useEditorInspector();

  const updateDisplay = (patch: Partial<PostDisplayFieldsInput>) => {
    onDisplayChange({ ...display, ...patch });
  };

  const resolvedAuthor = resolvePostAuthorName(display.authorName, userDisplayName);
  const resolvedAvatarUrl = resolvePostAuthorAvatarUrl({
    authorName: display.authorName,
    customAvatarUrl: authorAvatarUrl,
    profileAvatarUrl: userAvatarUrl,
  });
  const showAuthorAvatar =
    Boolean(resolvedAvatarUrl) || isPostAuthorProfile(display.authorName);
  const draftDateLabel = format(new Date(), "MMM d, yyyy");

  return (
    <PostHeader
      title={title}
      description={display.description}
      authorName={display.authorName}
      authorAvatarUrl={resolvedAvatarUrl}
      publishedAt={publishedAt}
      dateLabel={publishedAt ? null : draftDateLabel}
      editable={{
        onTitleChange,
        onDescriptionChange: (value) => updateDisplay({ description: value || null }),
        onFocus: clearSelectedBlock,
        titlePlaceholder: "Untitled post",
        authorSlot: (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onFocus={clearSelectedBlock}
                className={cn(
                  POST_HEADER_AUTHOR_ROW_CLASS,
                  "rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {showAuthorAvatar ? (
                  <PostHeaderAvatar
                    url={resolvedAvatarUrl}
                    name={resolvedAuthor || "Author"}
                  />
                ) : null}
                <span className={POST_HEADER_AUTHOR_NAME_CLASS}>
                  {resolvedAuthor || "Author"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-4" align="start">
              <PostAuthorNameSelector
                authorName={display.authorName ?? null}
                userDisplayName={userDisplayName}
                onChange={(authorName) => updateDisplay({ authorName })}
              />
              <div className="space-y-2">
                <Label>Author icon</Label>
                <MediaPicker
                  workspaceId={workspaceId}
                  selectedId={display.authorAvatarId ?? null}
                  onSelect={(media) => {
                    updateDisplay({ authorAvatarId: media?.id ?? null });
                    onAuthorAvatarUrlChange(media?.publicUrl ?? null);
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        ),
      }}
    />
  );
}
