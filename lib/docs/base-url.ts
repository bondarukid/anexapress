import { headers } from "next/headers";

import { isDocsHost } from "@/lib/docs/host";

/**
 * Public docs path prefix for sidebar and in-app links.
 *
 * On the docs subdomain URLs are clean (`/getting-started`); internally Next.js
 * serves the `/docs/*` route tree via middleware rewrite.
 */
export async function getDocsBaseUrl(): Promise<string> {
  const host = (await headers()).get("host") ?? "";
  return isDocsHost(host) ? "/" : "/docs";
}
