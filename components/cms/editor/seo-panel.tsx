"use client";

import type { SeoFieldsInput } from "@/schemas/seo.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/cms/media/media-picker";

type SeoPanelProps = {
  seo: SeoFieldsInput;
  onChange: (seo: SeoFieldsInput) => void;
  workspaceId: string;
};

export function SeoPanel({ seo, onChange, workspaceId }: SeoPanelProps) {
  const update = (patch: Partial<SeoFieldsInput>) => onChange({ ...seo, ...patch });

  const displayTitle = seo.seoTitle ?? "";
  const displayDescription = seo.seoDescription ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seo-title">SEO title</Label>
        <Input
          id="seo-title"
          value={displayTitle}
          onChange={(e) => update({ seoTitle: e.target.value || null })}
          maxLength={120}
        />
        <p className="text-muted-foreground text-xs">{displayTitle.length}/120</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-description">Meta description</Label>
        <Textarea
          id="seo-description"
          value={displayDescription}
          onChange={(e) => update({ seoDescription: e.target.value || null })}
          maxLength={320}
          rows={4}
        />
        <p className="text-muted-foreground text-xs">{displayDescription.length}/320</p>
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

      <div className="border-border rounded-md border p-3">
        <p className="text-muted-foreground mb-1 text-xs uppercase">Preview</p>
        <p className="text-primary truncate text-sm font-medium">
          {displayTitle || "Page title"}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {displayDescription || "Meta description will appear here."}
        </p>
      </div>
    </div>
  );
}
