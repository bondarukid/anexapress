"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Upload } from "lucide-react";

import {
  createSiteTextFileAction,
  deleteSiteFileAction,
  uploadSiteFileAction,
} from "@/actions/site/site.actions";
import { workspacePathFromSummary } from "@/lib/routing/workspace-paths";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SiteFileRecord } from "@/services/site-file.service";

type SiteFilesManagerProps = {
  files: SiteFileRecord[];
  siteId: string;
  workspaceId: string;
  siteName: string;
  primaryDomain?: string | null;
};

export function SiteFilesManager({
  files,
  siteId,
  workspaceId,
  siteName,
  primaryDomain,
}: SiteFilesManagerProps) {
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [publicPath, setPublicPath] = useState("/app-ads.txt");
  const [textContent, setTextContent] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!activeWorkspace) return null;

  const publicBase = primaryDomain ? `https://${primaryDomain}` : null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadPath =
      publicPath === "/google0000000000000000.html" && file.name.toLowerCase().startsWith("google")
        ? `/${file.name}`
      : publicPath === "/BingSiteAuth.xml" && file.name.toLowerCase().includes("bingsiteauth")
        ? `/${file.name}`
      : publicPath;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("workspaceId", workspaceId);
      formData.set("siteId", siteId);
      formData.set("publicPath", uploadPath);
      formData.set("file", file);

      const result = await uploadSiteFileAction(formData);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("File uploaded");
        router.refresh();
      }
    });
  };

  const handleCreateText = () => {
    startTransition(async () => {
      const result = await createSiteTextFileAction({
        workspaceId,
        siteId,
        publicPath,
        content: textContent,
      });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("File created");
        setTextContent("");
        router.refresh();
      }
    });
  };

  const handleDelete = (fileId: string) => {
    startTransition(async () => {
      const result = await deleteSiteFileAction({ workspaceId, siteId, fileId });
      if (!result.success) toast.error(result.error);
      else {
        toast.success("File deleted");
        router.refresh();
      }
    });
  };

  const applyPreset = (path: string, sample: string) => {
    setPublicPath(path);
    setTextContent(sample);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{siteName} — Site files</h1>
        <p className="text-muted-foreground text-sm">
          Files are served from the site root{publicBase ? ` on ${publicBase}` : ""}.
          Upload Google verification HTML or BingSiteAuth.xml for search engine HTML-file verification.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset("/app-ads.txt", "google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0")}
        >
          <Plus className="mr-1 size-4" />
          app-ads.txt preset
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            applyPreset("/robots.txt", "User-agent: *\nAllow: /\n")
          }
        >
          <Plus className="mr-1 size-4" />
          robots.txt preset
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPublicPath("/google0000000000000000.html")}
        >
          <Plus className="mr-1 size-4" />
          Google verification HTML
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPublicPath("/BingSiteAuth.xml")}
        >
          <Plus className="mr-1 size-4" />
          Bing verification file
        </Button>
      </div>

      <div className="border-border max-w-xl space-y-3 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="public-path">Public path</Label>
          <Input
            id="public-path"
            value={publicPath}
            onChange={(e) => setPublicPath(e.target.value)}
            placeholder="/app-ads.txt"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file-content">Text content (optional)</Label>
          <textarea
            id="file-content"
            className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={isPending || !textContent} onClick={handleCreateText}>
            <FileText className="mr-2 size-4" />
            Create text file
          </Button>
              <Button type="button" variant="outline" asChild disabled={isPending}>
            <label>
              <Upload className="mr-2 inline size-4" />
              Upload file
              <input
                type="file"
                className="hidden"
                accept=".html,.xml,.txt,text/html,text/xml,text/plain"
                onChange={handleUpload}
              />
            </label>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Path</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-mono text-sm">{file.publicPath}</TableCell>
              <TableCell>{file.mimeType}</TableCell>
              <TableCell>{file.size} B</TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
