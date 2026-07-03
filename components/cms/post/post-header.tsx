"use client";

import Image from "next/image";
import { format } from "date-fns";
import { UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { isPostAuthorProfile } from "@/lib/cms/post-author";

export const POST_HEADER_TITLE_CLASS =
  "text-foreground text-[2.75rem] leading-[1.1] font-bold tracking-tight text-balance break-words";
export const POST_HEADER_DESCRIPTION_CLASS =
  "text-muted-foreground mt-6 text-lg leading-relaxed";
export const POST_HEADER_AUTHOR_ROW_CLASS = "mt-10 flex items-center gap-3";
export const POST_HEADER_AUTHOR_NAME_CLASS = "text-foreground text-sm font-semibold";

type PostHeaderAuthorRowProps = {
  authorName: string;
  authorAvatarUrl?: string | null;
  /** Optional inline meta (e.g. publish date) shown after the name. */
  meta?: string | null;
  className?: string;
};

/**
 * Author row shared by the public post header and blog post cards.
 */
export function PostHeaderAuthorRow({
  authorName,
  authorAvatarUrl = null,
  meta,
  className,
}: PostHeaderAuthorRowProps) {
  const showAuthorAvatar =
    Boolean(authorAvatarUrl) || isPostAuthorProfile(authorName);
  const authorLabel = meta ? `${authorName} · ${meta}` : authorName;

  return (
    <div className={cn(POST_HEADER_AUTHOR_ROW_CLASS, className)}>
      {showAuthorAvatar ? (
        <PostHeaderAvatar url={authorAvatarUrl} name={authorName} />
      ) : null}
      <span className={POST_HEADER_AUTHOR_NAME_CLASS}>{authorLabel}</span>
    </div>
  );
}

const TITLE_FIELD_CLASS = cn(
  POST_HEADER_TITLE_CLASS,
  "field-sizing-content block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none",
);

const DESCRIPTION_FIELD_CLASS = cn(
  POST_HEADER_DESCRIPTION_CLASS,
  "field-sizing-content block w-full resize-none border-0 bg-transparent p-0 outline-none",
);

export type PostHeaderEditableConfig = {
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFocus?: () => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  /** Replaces the default author row (e.g. popover with author settings in the editor). */
  authorSlot?: ReactNode;
};

export type PostHeaderProps = {
  title: string;
  description?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  publishedAt?: string | null;
  /** Shown when the post is not published yet (editor preview). */
  dateLabel?: string | null;
  className?: string;
  /** Inline editing with the same layout as the public header. */
  editable?: PostHeaderEditableConfig;
};

/**
 * Blog post header — date, title, optional description, author row.
 * Shared by the public site and the post editor (pass `editable` in the editor).
 */
export function PostHeader({
  title,
  description,
  authorName,
  authorAvatarUrl,
  publishedAt,
  dateLabel,
  className,
  editable,
}: PostHeaderProps) {
  const dateText = publishedAt
    ? format(new Date(publishedAt), "MMM d, yyyy")
    : (dateLabel ?? null);
  const dateTimeValue = publishedAt ?? (dateText ? new Date().toISOString() : undefined);

  const resolvedAuthor = authorName?.trim() || null;
  const hasDescription = Boolean(description?.trim());
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [descriptionEditing, setDescriptionEditing] = useState(hasDescription);

  useEffect(() => {
    if (hasDescription) {
      setDescriptionEditing(true);
    }
  }, [hasDescription]);

  const handleFocus = useCallback(() => {
    editable?.onFocus?.();
  }, [editable]);

  const showDescription = editable
    ? hasDescription || descriptionEditing
    : hasDescription;

  const focusDescription = useCallback(() => {
    setDescriptionEditing(true);
    requestAnimationFrame(() => descriptionRef.current?.focus());
  }, []);

  return (
    <header className={cn("mb-14", className)}>
      {dateText ? (
        <time
          className="text-muted-foreground mb-8 block text-sm font-normal"
          dateTime={dateTimeValue}
        >
          {dateText}
        </time>
      ) : null}

      {editable ? (
        <textarea
          value={title}
          onChange={(event) => editable.onTitleChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
            if (event.key === "Tab" && !event.shiftKey && !showDescription) {
              event.preventDefault();
              focusDescription();
            }
          }}
          placeholder={editable.titlePlaceholder ?? "Untitled post"}
          rows={1}
          className={cn(TITLE_FIELD_CLASS, "placeholder:text-muted-foreground/60")}
        />
      ) : (
        <h1 className={POST_HEADER_TITLE_CLASS}>{title}</h1>
      )}

      {showDescription ? (
        editable ? (
          <textarea
            ref={descriptionRef}
            value={description ?? ""}
            onChange={(event) => editable.onDescriptionChange(event.target.value)}
            onFocus={() => {
              setDescriptionEditing(true);
              handleFocus();
            }}
            onBlur={() => {
              if (!description?.trim()) {
                setDescriptionEditing(false);
              }
            }}
            placeholder={editable.descriptionPlaceholder ?? "Short description for the post header"}
            rows={1}
            maxLength={500}
            className={cn(
              DESCRIPTION_FIELD_CLASS,
              "placeholder:text-muted-foreground/60",
            )}
          />
        ) : (
          <p className={POST_HEADER_DESCRIPTION_CLASS}>{description?.trim()}</p>
        )
      ) : null}

      {editable?.authorSlot ?? (
        resolvedAuthor ? (
          <PostHeaderAuthorRow
            authorName={resolvedAuthor}
            authorAvatarUrl={authorAvatarUrl ?? null}
          />
        ) : null
      )}
    </header>
  );
}

export function PostHeaderAvatar({ url, name }: { url: string | null; name: string }) {
  if (!url) {
    return (
      <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60">
        <UserRound className="size-5" />
      </div>
    );
  }

  const isProxiedAuthorAvatar = url.includes("/author-avatar/");

  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border/60">
      {isProxiedAuthorAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- proxied dynamic route; next/image optimizer cannot fetch it reliably
        <img src={url} alt={name} className="size-full object-cover" />
      ) : (
        <Image src={url} alt={name} fill className="object-cover" sizes="40px" />
      )}
    </div>
  );
}
