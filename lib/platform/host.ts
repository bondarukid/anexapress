function normalizePlatformUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname.endsWith(".localhost");
}

function platformUrlFromLocalHost(port?: string): string {
  const portSuffix = port ? `:${port}` : ":3000";
  return `http://platform.localhost${portSuffix}`;
}

function platformUrlFromSiteUrl(siteUrl: string): string | null {
  try {
    const parsed = new URL(siteUrl);
    if (!isLocalHostname(parsed.hostname)) {
      return null;
    }

    return normalizePlatformUrl(platformUrlFromLocalHost(parsed.port || undefined));
  } catch {
    return null;
  }
}

function platformUrlFromRequestHost(requestHost: string): string | null {
  const [hostname, port] = requestHost.split(":");
  if (!isLocalHostname(hostname)) {
    return null;
  }

  if (hostname.startsWith("platform.")) {
    return normalizePlatformUrl(`http://${requestHost}`);
  }

  return platformUrlFromLocalHost(port);
}

/** Whether platform subdomain routing is configured via `PLATFORM_HOST`. */
export function isPlatformRoutingEnabled(): boolean {
  return Boolean(process.env.PLATFORM_HOST?.trim());
}

/**
 * Resolves the public platform (SaaS) site URL.
 *
 * Priority:
 * 1. `NEXT_PUBLIC_PLATFORM_URL` — explicit override
 * 2. `NEXT_PUBLIC_SITE_URL` — derive `platform.localhost` when on local dev
 * 3. `requestHost` — runtime localhost detection (server components / proxy)
 * 4. Local dev fallback
 */
export function resolvePlatformSiteUrl(requestHost?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_PLATFORM_URL;
  if (fromEnv) {
    return normalizePlatformUrl(fromEnv);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    const derived = platformUrlFromSiteUrl(siteUrl);
    if (derived) {
      return derived;
    }
  }

  if (requestHost) {
    const derived = platformUrlFromRequestHost(requestHost);
    if (derived) {
      return derived;
    }
  }

  return normalizePlatformUrl(platformUrlFromLocalHost());
}

/**
 * Detects whether the request targets the platform subdomain.
 *
 * Used in proxy to serve the full SaaS app (marketing, auth, dashboard).
 */
export function isPlatformHost(host: string): boolean {
  const configured = process.env.PLATFORM_HOST?.split(":")[0];
  if (configured && host.split(":")[0] === configured) {
    return true;
  }

  const normalized = host.split(":")[0];
  return normalized.startsWith("platform.") && isLocalHostname(normalized);
}

/**
 * Detects whether the request targets the apex domain that should redirect to platform.
 *
 * When `APEX_HOST` is unset, local `localhost` (without `platform.` prefix) is treated as apex
 * only when platform routing is enabled.
 */
export function isApexHost(host: string): boolean {
  if (!isPlatformRoutingEnabled()) {
    return false;
  }

  if (isPlatformHost(host) || isDocsHostForApexCheck(host)) {
    return false;
  }

  const hostname = host.split(":")[0];
  const configuredApex = process.env.APEX_HOST?.split(":")[0];
  if (configuredApex) {
    return hostname === configuredApex;
  }

  return hostname === "localhost";
}

/** Avoid circular import with docs host — inline docs hostname check for apex exclusion. */
function isDocsHostForApexCheck(host: string): boolean {
  const configured = process.env.DOCS_HOST?.split(":")[0];
  if (configured && host.split(":")[0] === configured) {
    return true;
  }

  const normalized = host.split(":")[0];
  return normalized.startsWith("docs.") && isLocalHostname(normalized);
}

/** Build an absolute platform URL for cross-site links and proxy redirects. */
export function getPlatformSiteUrl(requestHost?: string): string {
  return resolvePlatformSiteUrl(requestHost);
}
