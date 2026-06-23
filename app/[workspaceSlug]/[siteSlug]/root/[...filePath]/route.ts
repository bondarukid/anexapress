import { NextResponse } from "next/server";

import { getSiteBySlug } from "@/lib/cms/resolve-site";
import {
  fetchSiteFileBody,
  getSiteFileByPublicPath,
} from "@/services/site-file.service";

type RouteContext = {
  params: Promise<{ workspaceSlug: string; siteSlug: string; filePath: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { workspaceSlug, siteSlug, filePath } = await context.params;
  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) {
    return new NextResponse("Not found", { status: 404 });
  }

  const publicPath = `/${filePath.join("/")}`;
  const record = await getSiteFileByPublicPath(resolved.site.id, publicPath);
  if (!record) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await fetchSiteFileBody(record);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": record.mimeType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
