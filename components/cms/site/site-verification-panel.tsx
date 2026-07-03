"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { updateSiteSettingsAction } from "@/actions/site/site.actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatVerificationMetaTag,
  getVerificationTagByProvider,
  parseVerificationMetaInput,
} from "@/lib/cms/parse-verification-meta";
import type { Site, SiteVerificationMetaTag } from "@/types/site";

type SiteVerificationPanelProps = {
  site: Site;
  workspaceId: string;
  filesHref: string;
};

function initialInputValue(
  tags: SiteVerificationMetaTag[],
  provider: "google" | "bing",
): string {
  const tag = getVerificationTagByProvider(tags, provider);
  return tag ? formatVerificationMetaTag(tag) : "";
}

export function SiteVerificationPanel({
  site,
  workspaceId,
  filesHref,
}: SiteVerificationPanelProps) {
  const [googleInput, setGoogleInput] = useState(() =>
    initialInputValue(site.verificationMetaTags, "google"),
  );
  const [bingInput, setBingInput] = useState(() =>
    initialInputValue(site.verificationMetaTags, "bing"),
  );
  const [isPending, startTransition] = useTransition();

  const googlePreview = useMemo(
    () => parseVerificationMetaInput(googleInput, "google"),
    [googleInput],
  );
  const bingPreview = useMemo(() => parseVerificationMetaInput(bingInput, "bing"), [bingInput]);

  const verificationUrl =
    site.primaryDomain ? `https://${site.primaryDomain}/` : null;

  const saveVerification = () => {
    if (googleInput.trim() && !googlePreview) {
      toast.error("Could not parse the Google verification tag.");
      return;
    }
    if (bingInput.trim() && !bingPreview) {
      toast.error("Could not parse the Bing verification tag.");
      return;
    }

    startTransition(async () => {
      const result = await updateSiteSettingsAction({
        siteId: site.id,
        workspaceId,
        googleVerificationInput: googleInput.trim() ? googleInput : null,
        bingVerificationInput: bingInput.trim() ? bingInput : null,
      });
      if (!result.success) toast.error(result.error);
      else toast.success("Search engine verification updated");
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Search engine verification</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          Add your custom domain in Search Console or Bing Webmaster Tools, then paste the meta tag
          here or upload the HTML verification file.
        </p>
      </div>

      {!site.primaryDomain ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Connect a custom domain first</AlertTitle>
          <AlertDescription>
            Without a custom domain, verification may bind to the platform URL instead of your own
            site. Add a domain above and set it as primary before verifying.
          </AlertDescription>
        </Alert>
      ) : (
        <p className="text-muted-foreground text-xs">
          Verify this URL in your search engine:{" "}
          <strong className="text-foreground">{verificationUrl}</strong>
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="google-verification">Google Search Console</Label>
        <Textarea
          id="google-verification"
          value={googleInput}
          onChange={(e) => setGoogleInput(e.target.value)}
          placeholder='<meta name="google-site-verification" content="..." />'
          rows={3}
          disabled={isPending}
        />
        {googlePreview ? (
          <p className="text-muted-foreground text-xs">
            Parsed: <code>{googlePreview.name}</code> = <code>{googlePreview.content}</code>
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bing-verification">Bing Webmaster Tools</Label>
        <Textarea
          id="bing-verification"
          value={bingInput}
          onChange={(e) => setBingInput(e.target.value)}
          placeholder='<meta name="msvalidate.01" content="..." />'
          rows={3}
          disabled={isPending}
        />
        {bingPreview ? (
          <p className="text-muted-foreground text-xs">
            Parsed: <code>{bingPreview.name}</code> = <code>{bingPreview.content}</code>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={saveVerification} disabled={isPending}>
          Save verification tags
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href={filesHref}>Upload HTML verification file</Link>
        </Button>
      </div>

      <p className="text-muted-foreground text-xs">
        For HTML-file verification, upload <code>google*.html</code> or{" "}
        <code>BingSiteAuth.xml</code> in the file manager. It will be served from your site root
        {site.primaryDomain ? ` on https://${site.primaryDomain}` : ""}.
      </p>
    </div>
  );
}
