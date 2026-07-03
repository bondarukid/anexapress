import {
  getEmbedUrlFromYoutubeUrl,
  isValidYoutubeUrl,
} from "@tiptap/extension-youtube";

export type YoutubeEmbedResolution = {
  /** Original watch/youtu.be URL stored in the youtube node attrs.src */
  src: string;
  /** Embed URL for iframe preview */
  embedUrl: string;
};

/**
 * Validates a YouTube URL and returns both the canonical src and embed URL.
 *
 * Uses the same helpers as the Tiptap Youtube extension so preview and editor
 * stay in sync.
 */
export function resolveYoutubeEmbed(input: string): YoutubeEmbedResolution | null {
  const trimmed = input.trim();
  if (!trimmed || !isValidYoutubeUrl(trimmed)) {
    return null;
  }

  const embedUrl = getEmbedUrlFromYoutubeUrl({ url: trimmed });
  if (!embedUrl) {
    return null;
  }

  return { src: trimmed, embedUrl };
}
