function normalizeDocsUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname.endsWith(".localhost");
}

function docsUrlFromLocalHost(port?: string): string {
  const portSuffix = port ? `:${port}` : ":3000";
  return `http://docs.localhost${portSuffix}`;
}

function docsUrlFromSiteUrl(siteUrl: string): string | null {
  try {
    const parsed = new URL(siteUrl);
    if (!isLocalHostname(parsed.hostname)) {
      return null;
    }

    return normalizeDocsUrl(docsUrlFromLocalHost(parsed.port || undefined));
  } catch {
    return null;
  }
}

function docsUrlFromRequestHost(requestHost: string): string | null {
  const [hostname, port] = requestHost.split(":");
  if (!isLocalHostname(hostname)) {
    return null;
  }

  if (hostname.startsWith("docs.")) {
    return normalizeDocsUrl(`http://${requestHost}`);
  }

  return docsUrlFromLocalHost(port);
}

/**
 * Resolves the public documentation site URL.
 *
 * Priority:
 * 1. `NEXT_PUBLIC_DOCS_URL` — explicit override
 * 2. `NEXT_PUBLIC_SITE_URL` — derive `docs.localhost` when on local dev
 * 3. `requestHost` — runtime localhost detection (server components / middleware)
 * 4. Local dev fallback
 */
export function resolveDocsSiteUrl(requestHost?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_DOCS_URL;
  if (fromEnv) {
    return normalizeDocsUrl(fromEnv);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    const derived = docsUrlFromSiteUrl(siteUrl);
    if (derived) {
      return derived;
    }
  }

  if (requestHost) {
    const derived = docsUrlFromRequestHost(requestHost);
    if (derived) {
      return derived;
    }
  }

  return normalizeDocsUrl(docsUrlFromLocalHost());
}

/**
 * Detects whether the request targets the documentation subdomain.
 *
 * Used in middleware to rewrite clean URLs and skip dashboard auth redirects.
 */
export function isDocsHost(host: string): boolean {
  const configured = process.env.DOCS_HOST?.split(":")[0];
  if (configured && host.split(":")[0] === configured) {
    return true;
  }

  const normalized = host.split(":")[0];
  return normalized.startsWith("docs.") && isLocalHostname(normalized);
}

/** Build an absolute docs URL for cross-site links and middleware redirects. */
export function getDocsSiteUrl(requestHost?: string): string {
  return resolveDocsSiteUrl(requestHost);
}

/** Public marketing site URL from env with localhost fallback. */
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return normalizeDocsUrl(siteUrl);
  }

  return "http://localhost:3000";
}

/** Hostname label for workspace slug previews and contact links. */
export function getSiteHostLabel(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return "localhost";

  try {
    return new URL(siteUrl).host;
  } catch {
    return "localhost";
  }
}
