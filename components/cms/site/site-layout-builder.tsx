"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateSiteLayoutAction } from "@/actions/site/site.actions";
import { MediaPicker } from "@/components/cms/media/media-picker";
import { MainFooter } from "@/components/site-shell/main-footer";
import { MainHeader } from "@/components/site-shell/main-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildSiteBasePath } from "@/lib/cms/site-paths";
import type { SiteLayout, SiteSummary } from "@/types/site";
import type { HeaderConfig, FooterConfig } from "@/schemas/site-layout.schema";

type SiteLayoutBuilderProps = {
  layout: SiteLayout;
  site: SiteSummary;
  workspaceId: string;
  workspaceSlug: string;
  logoUrl?: string | null;
};

export function SiteLayoutBuilder({
  layout,
  site,
  workspaceId,
  workspaceSlug,
  logoUrl,
}: SiteLayoutBuilderProps) {
  const basePath = buildSiteBasePath(workspaceSlug, site.slug);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(layout.headerConfig);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(layout.footerConfig);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(logoUrl ?? null);
  const [isPending, startTransition] = useTransition();

  const addNavItem = () => {
    setHeaderConfig((prev) => ({
      ...prev,
      nav: [...prev.nav, { label: "New link", pageSlug: "about" }],
    }));
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateSiteLayoutAction({
        siteId: site.id,
        workspaceId,
        headerConfig,
        footerConfig,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Layout saved");
    });
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Site layout — {site.name}</h1>
        <Button type="button" onClick={save} disabled={isPending}>
          Save layout
        </Button>
      </div>

      <div className="border-border rounded-lg border p-4">
        <h2 className="mb-4 font-medium">Preview</h2>
        <MainHeader config={headerConfig} basePath={basePath} logoUrl={previewLogoUrl} />
        <div className="bg-muted/30 h-24" />
        <MainFooter config={footerConfig} basePath={basePath} siteName={site.name} />
      </div>

      <div className="grid max-w-xl gap-4">
        <div className="space-y-2">
          <Label>Logo text</Label>
          <Input
            value={headerConfig.logo.text}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                logo: { ...prev.logo, text: e.target.value },
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Logo image (media library)</Label>
          <MediaPicker
            workspaceId={workspaceId}
            selectedId={headerConfig.logo.mediaId ?? null}
            onSelect={(media) => {
              setHeaderConfig((prev) => ({
                ...prev,
                logo: {
                  ...prev.logo,
                  mediaId: media?.id ?? undefined,
                },
              }));
              setPreviewLogoUrl(media?.publicUrl ?? logoUrl ?? null);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Navigation</Label>
            <Button type="button" variant="outline" size="sm" onClick={addNavItem}>
              Add link
            </Button>
          </div>
          {headerConfig.nav.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const nav = [...headerConfig.nav];
                  nav[index] = { ...nav[index], label: e.target.value };
                  setHeaderConfig((prev) => ({ ...prev, nav }));
                }}
              />
              <Input
                placeholder="page slug"
                value={item.pageSlug}
                onChange={(e) => {
                  const nav = [...headerConfig.nav];
                  nav[index] = { ...nav[index], pageSlug: e.target.value };
                  setHeaderConfig((prev) => ({ ...prev, nav }));
                }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Footer tagline</Label>
          <Input
            value={footerConfig.tagline ?? ""}
            onChange={(e) =>
              setFooterConfig((prev) => ({ ...prev, tagline: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Copyright</Label>
          <Input
            value={footerConfig.copyright ?? ""}
            onChange={(e) =>
              setFooterConfig((prev) => ({ ...prev, copyright: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}
