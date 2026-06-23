import { resolvePlatformSiteUrl } from "@/lib/platform/host";

/**
 * Public site origin from `.env` — used for OAuth redirectTo and auth emails.
 *
 * Prefers `NEXT_PUBLIC_PLATFORM_URL` when set so auth callbacks target the platform subdomain.
 */
export function getSiteOrigin(): string {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL?.replace(/\/$/, "");
  if (platformUrl) {
    return platformUrl;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (siteUrl) {
    return siteUrl;
  }

  return resolvePlatformSiteUrl();
}
