"use client";

import { Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveYoutubeEmbed } from "@/lib/cms/youtube-url";
import { cn } from "@/lib/utils";

const PREVIEW_DEBOUNCE_MS = 300;

type YoutubeEmbedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (src: string) => void;
};

/**
 * Dialog for inserting a YouTube embed: URL input on the left, live preview on the right.
 */
export function YoutubeEmbedDialog({
  open,
  onOpenChange,
  onInsert,
}: YoutubeEmbedDialogProps) {
  const [url, setUrl] = useState("");
  const [debouncedUrl, setDebouncedUrl] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl("");
      setDebouncedUrl("");
      setShowError(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedUrl(url);
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, url]);

  const resolution = debouncedUrl.trim() ? resolveYoutubeEmbed(debouncedUrl) : null;
  const canInsert = Boolean(url.trim() && resolveYoutubeEmbed(url));

  const handleInsert = useCallback(() => {
    const result = resolveYoutubeEmbed(url);
    if (!result) {
      setShowError(true);
      return;
    }

    onInsert(result.src);
    onOpenChange(false);
  }, [onInsert, onOpenChange, url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <div className="flex min-h-[min(80vh,640px)] flex-col">
          <div className="grid flex-1 grid-cols-1 md:grid-cols-[minmax(300px,380px)_1fr]">
            <div className="flex flex-col gap-5 border-b p-8 md:border-r md:border-b-0">
              <div>
                <DialogTitle className="text-lg">Insert YouTube video</DialogTitle>
                <DialogDescription className="mt-1.5 text-sm">
                  Paste a YouTube link. Preview updates as you type.
                </DialogDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setShowError(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleInsert();
                    }
                  }}
                  autoFocus
                />
                {showError || (debouncedUrl.trim() && !resolution) ? (
                  <p className="text-destructive text-xs">
                    Enter a valid YouTube URL (youtube.com or youtu.be).
                  </p>
                ) : null}
              </div>
            </div>

            <div className="bg-muted/30 flex min-h-[280px] flex-col p-8 md:min-h-0">
              <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-wide">
                Preview
              </p>
              <div
                className={cn(
                  "border-border flex min-h-[240px] flex-1 items-center justify-center overflow-hidden rounded-xl border bg-background md:min-h-0",
                  !resolution && "border-dashed",
                )}
              >
                {resolution ? (
                  <iframe
                    key={resolution.embedUrl}
                    src={resolution.embedUrl}
                    title="YouTube video preview"
                    className="aspect-video h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-3 px-6 text-center text-base">
                    <Video className="size-12 opacity-50" />
                    <p>Paste a YouTube link to preview the video here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-border bg-muted/40 flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInsert} disabled={!canInsert}>
              Insert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
