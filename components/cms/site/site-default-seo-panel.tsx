"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateSiteSettingsAction } from "@/actions/site/site.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Site } from "@/types/site";

type SiteDefaultSeoPanelProps = {
  site: Site;
  workspaceId: string;
};

export function SiteDefaultSeoPanel({ site, workspaceId }: SiteDefaultSeoPanelProps) {
  const [seoTitle, setSeoTitle] = useState(site.seoDefaultTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(site.seoDefaultDescription ?? "");
  const [isPending, startTransition] = useTransition();

  const saveSeoDefaults = () => {
    startTransition(async () => {
      const result = await updateSiteSettingsAction({
        siteId: site.id,
        workspaceId,
        seoDefaultTitle: seoTitle.trim() ? seoTitle.trim() : null,
        seoDefaultDescription: seoDescription.trim() ? seoDescription.trim() : null,
      });
      if (!result.success) toast.error(result.error);
      else toast.success("Default SEO updated");
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Default SEO</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          Used as fallback title and description for pages and posts without their own SEO fields.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-default-title">Default title</Label>
        <Input
          id="seo-default-title"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder={site.name}
          maxLength={120}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seo-default-description">Default description</Label>
        <Textarea
          id="seo-default-description"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Short description for search engines"
          rows={3}
          maxLength={320}
          disabled={isPending}
        />
      </div>

      <Button type="button" onClick={saveSeoDefaults} disabled={isPending}>
        Save default SEO
      </Button>
    </div>
  );
}
