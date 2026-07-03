import { NextResponse } from "next/server";

import { getSiteBySlug } from "@/lib/cms/resolve-site";
import {
  fetchProfileAvatarPayload,
  isPublishedAuthorOnSite,
} from "@/services/author-avatar.service";

type AuthorAvatarRouteContext = {
  params: Promise<{ workspaceSlug: string; slug: string; userId: string }>;
};

/**
 * Proxies a post author's profile avatar for anonymous readers.
 * Storage URLs are not exposed; only published authors on this site are served.
 */
export async function GET(_request: Request, context: AuthorAvatarRouteContext) {
  const { workspaceSlug, slug: siteSlug, userId } = await context.params;

  const resolved = await getSiteBySlug(workspaceSlug, siteSlug);
  if (!resolved) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAuthor = await isPublishedAuthorOnSite(resolved.site.id, userId);
  if (!isAuthor) {
    return new NextResponse("Not found", { status: 404 });
  }

  const payload = await fetchProfileAvatarPayload(userId);
  if (!payload) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(payload.body, {
    status: 200,
    headers: {
      "Content-Type": payload.contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
