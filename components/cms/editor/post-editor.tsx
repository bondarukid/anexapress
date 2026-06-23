"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { isTextSelection } from "@tiptap/core";
import type { EditorContentProps, JSONContent } from "novel";
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
  useEditor,
} from "novel";

import { CmsImageResizer } from "@/components/cms/editor/cms-image-resizer";
import {
  buildEditorExtensions,
  buildSuggestionItems,
} from "@/components/cms/editor/extensions";
import { ColorSelector } from "@/components/cms/editor/selectors/color-selector";
import { LinkSelector } from "@/components/cms/editor/selectors/link-selector";
import { NodeSelector } from "@/components/cms/editor/selectors/node-selector";
import { TextButtons } from "@/components/cms/editor/selectors/text-buttons";
import { Separator } from "@/components/ui/separator";
import { cmsContentTypographyClassName } from "@/lib/cms/content-typography";
import { insertAtomBlockWithTrailingParagraph } from "@/lib/cms/editor-insert-helpers";
import { createEditorImageUpload } from "@/lib/cms/editor-image-upload";
import { sanitizeTiptapContent } from "@/lib/cms/sanitize-tiptap-content";
import { cn } from "@/lib/utils";
import type { TiptapContent } from "@/types/tiptap";

import "@/app/prosemirror.css";

export type PostEditorImageAttrs = {
  mediaId: string;
  src: string;
  alt: string;
};

export type PostEditorHandle = {
  insertImage: (attrs: PostEditorImageAttrs) => void;
};

type PostEditorProps = {
  initialContent: TiptapContent;
  onChange: (content: TiptapContent) => void;
  workspaceId: string;
  siteId?: string | null;
  onImageRequest?: () => void;
  className?: string;
};

type EditorBridgeProps = {
  editorRef: React.Ref<PostEditorHandle>;
};

function EditorBridge({ editorRef }: EditorBridgeProps) {
  const { editor } = useEditor();

  useImperativeHandle(
    editorRef,
    () => ({
      insertImage: (attrs) => {
        if (!editor) return;
        insertAtomBlockWithTrailingParagraph(editor, {
          type: "image",
          attrs: {
            src: attrs.src,
            alt: attrs.alt,
            mediaId: attrs.mediaId,
          },
        });
      },
    }),
    [editor],
  );

  return null;
}

/**
 * Novel/Tiptap block editor for post and page body content.
 */
export const PostEditor = forwardRef<PostEditorHandle, PostEditorProps>(function PostEditor(
  {
    initialContent,
    onChange,
    workspaceId,
    siteId,
    onImageRequest,
    className,
  },
  ref,
) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensionOptions = useMemo(
    () => ({
      onImageRequest,
    }),
    [onImageRequest],
  );

  const extensions = useMemo(
    () => buildEditorExtensions(extensionOptions),
    [extensionOptions],
  );

  const suggestionItems = useMemo(
    () => buildSuggestionItems(extensionOptions),
    [extensionOptions],
  );

  const uploadFn = useMemo(
    () => createEditorImageUpload(workspaceId, siteId),
    [siteId, workspaceId],
  );

  const handleUpdate = useCallback(({ editor }: { editor: { getJSON: () => JSONContent } }) => {
    onChangeRef.current(sanitizeTiptapContent(editor.getJSON()));
  }, []);

  return (
    <EditorRoot>
      <EditorContent
        className={cn(
          cmsContentTypographyClassName(
            "min-h-[50vh] w-full rounded-xl border border-transparent bg-background/80 px-1 py-2 focus-within:border-border focus-within:bg-background focus:outline-none sm:px-4 sm:py-4",
          ),
          className,
        )}
        extensions={extensions as EditorContentProps["extensions"]}
        immediatelyRender={false}
        initialContent={sanitizeTiptapContent(initialContent) as JSONContent}
        onUpdate={handleUpdate}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event) ?? false,
          },
          handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          attributes: {
            class: cmsContentTypographyClassName(
              "min-h-[50vh] focus:outline-none",
            ),
          },
        }}
      >
        <EditorBridge editorRef={ref} />

        <EditorCommand className="border-border bg-background z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border px-1 py-2 shadow-md">
          <EditorCommandEmpty className="text-muted-foreground px-2">No results</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={item.command ?? (() => undefined)}
                className="hover:bg-accent aria-selected:bg-accent flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm"
              >
                <div className="border-border bg-background flex h-10 w-10 items-center justify-center rounded-md border">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        <EditorBubble
          tippyOptions={{ placement: "top" }}
          className="border-border bg-background flex w-fit max-w-[90vw] items-center overflow-hidden rounded-md border shadow-md"
          shouldShow={({ editor, state }) => {
            const { selection } = state;
            const { empty } = selection;

            if (
              !editor.isEditable ||
              editor.isActive("image") ||
              empty ||
              !isTextSelection(selection)
            ) {
              return false;
            }

            return true;
          }}
        >
          <NodeSelector />
          <Separator orientation="vertical" className="h-6" />
          <TextButtons />
          <Separator orientation="vertical" className="h-6" />
          <LinkSelector />
          <Separator orientation="vertical" className="h-6" />
          <ColorSelector />
        </EditorBubble>

        <CmsImageResizer />
      </EditorContent>
    </EditorRoot>
  );
});
