"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PostSlugFieldProps = {
  slug: string;
  onSlugChange: (slug: string) => void;
  onSlugTouch?: () => void;
};

function normalizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Editable post slug field for editor settings.
 */
export function PostSlugField({ slug, onSlugChange, onSlugTouch }: PostSlugFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="post-settings-slug">URL slug</Label>
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
          /
        </span>
        <Input
          id="post-settings-slug"
          value={slug}
          onChange={(event) => {
            onSlugTouch?.();
            onSlugChange(normalizeSlugInput(event.target.value));
          }}
          placeholder="post-slug"
          className="pl-7 font-mono text-sm"
          spellCheck={false}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        Lowercase letters, numbers, and hyphens only. Used in the public post URL.
      </p>
    </div>
  );
}
