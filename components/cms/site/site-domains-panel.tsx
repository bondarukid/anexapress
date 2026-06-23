"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import {
  addSiteDomainAction,
  removeSiteDomainAction,
  setPrimarySiteDomainAction,
} from "@/actions/site/site.actions";
import { getPlatformHostHint } from "@/lib/cms/site-host";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteDomain } from "@/types/site";

type SiteDomainsPanelProps = {
  siteId: string;
  workspaceId: string;
  domains: SiteDomain[];
};

export function SiteDomainsPanel({ siteId, workspaceId, domains: initialDomains }: SiteDomainsPanelProps) {
  const [domains, setDomains] = useState(initialDomains);
  const [domainInput, setDomainInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const platformHost = getPlatformHostHint();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await addSiteDomainAction({
        siteId,
        workspaceId,
        domain: domainInput,
        isPrimary: domains.length === 0,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Domain added");
      setDomainInput("");
      window.location.reload();
    });
  };

  const handleRemove = (domainId: string) => {
    startTransition(async () => {
      const result = await removeSiteDomainAction({ siteId, workspaceId, domainId });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Domain removed");
        setDomains((prev) => prev.filter((d) => d.id !== domainId));
      }
    });
  };

  const handleSetPrimary = (domainId: string) => {
    startTransition(async () => {
      const result = await setPrimarySiteDomainAction({ siteId, workspaceId, domainId });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Primary domain updated");
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Custom domains</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          Point a CNAME record to <strong>{platformHost}</strong>. Your site will be served on the
          custom domain without the workspace path prefix.
        </p>
      </div>

      {domains.length > 0 ? (
        <ul className="space-y-2">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="border-border flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{domain.domain}</span>
                {domain.isPrimary ? <Badge variant="secondary">Primary</Badge> : null}
              </div>
              <div className="flex gap-1">
                {!domain.isPrimary ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSetPrimary(domain.id)}
                  >
                    Set primary
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleRemove(domain.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">No custom domains yet.</p>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="blog.example.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          required
        />
        <Button type="submit" disabled={isPending}>
          Add domain
        </Button>
      </form>
    </div>
  );
}
