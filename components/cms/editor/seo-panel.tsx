"use client";

import type { SeoFieldsInput } from "@/schemas/seo.schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/cms/media/media-picker";

type SeoPanelProps = {
  seo: SeoFieldsInput;
  onChange: (seo: SeoFieldsInput) => void;
  workspaceId: string;
  /** Post page description from General — used only when SEO sync is enabled. */
  postDescription?: string | null;
};

export function SeoPanel({
  seo,
  onChange,
  workspaceId,
  postDescription = null,
}: SeoPanelProps) {
  const update = (patch: Partial<SeoFieldsInput>) => onChange({ ...seo, ...patch });

  const seoTitle = seo.seoTitle ?? "";
  const usePostDescriptionForSeo = seo.usePostDescriptionForSeo ?? false;
  const seoMetaPreview = usePostDescriptionForSeo
    ? (postDescription ?? "")
    : (seo.seoDescription ?? "");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seo-title">SEO title</Label>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Used in the browser tab, Google, and social previews. Does not change the title on the post
          page — set that in General. If empty, the post title is used.
        </p>
        <Input
          id="seo-title"
          value={seoTitle}
          onChange={(e) => update({ seoTitle: e.target.value || null })}
          maxLength={120}
          placeholder="Separate SEO title (optional)"
        />
        <p className="text-muted-foreground text-xs">{seoTitle.length}/120</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="seo-description">Meta description</Label>
          <label
            htmlFor="seo-use-post-description"
            className="text-muted-foreground flex shrink-0 cursor-pointer items-center gap-2"
          >
            <Checkbox
              id="seo-use-post-description"
              checked={usePostDescriptionForSeo}
              onCheckedChange={(checked) =>
                update({ usePostDescriptionForSeo: checked === true })
              }
            />
            <span className="text-sm">Use post description for meta description</span>
          </label>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Meta description for search engines and social previews. Does not change the text under the
          title on the page — set that in General. Enable the checkbox above to mirror the post
          description.
        </p>
        <Textarea
          id="seo-description"
          value={seoMetaPreview}
          onChange={(e) => update({ seoDescription: e.target.value || null })}
          maxLength={320}
          rows={4}
          disabled={usePostDescriptionForSeo}
          className={usePostDescriptionForSeo ? "bg-muted/50" : undefined}
          placeholder="Separate description for search engines"
        />
        <p className="text-muted-foreground text-xs">{seoMetaPreview.length}/320</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-canonical">Canonical URL</Label>
        <Input
          id="seo-canonical"
          value={seo.seoCanonical ?? ""}
          onChange={(e) => update({ seoCanonical: e.target.value || null })}
          placeholder="https://"
        />
      </div>

      <div className="space-y-2">
        <Label>OG image</Label>
        <MediaPicker
          workspaceId={workspaceId}
          selectedId={seo.ogImageId ?? null}
          onSelect={(media) => update({ ogImageId: media?.id ?? null })}
        />
      </div>
    </div>
  );
}
