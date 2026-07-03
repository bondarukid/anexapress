import type { SiteVerificationMetaTag, SiteVerificationProvider } from "@/types/site";

const META_NAME_CONTENT_REGEX =
  /<meta\s+[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i;
const META_CONTENT_NAME_REGEX =
  /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']([^"']+)["'][^>]*\/?>/i;

const PROVIDER_BY_META_NAME: Record<string, SiteVerificationProvider> = {
  "google-site-verification": "google",
  "msvalidate.01": "bing",
};

const DEFAULT_META_NAME_BY_PROVIDER: Record<"google" | "bing", string> = {
  google: "google-site-verification",
  bing: "msvalidate.01",
};

function inferProvider(name: string): SiteVerificationProvider {
  return PROVIDER_BY_META_NAME[name] ?? "other";
}

/**
 * Parses a verification meta tag pasted from Google/Bing or a bare content token.
 *
 * @param input - Full `<meta ...>` tag or verification content string
 * @param defaultProvider - Used when input is content-only (no meta tag markup)
 */
export function parseVerificationMetaInput(
  input: string,
  defaultProvider?: "google" | "bing",
): SiteVerificationMetaTag | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const nameFirst = trimmed.match(META_NAME_CONTENT_REGEX);
  if (nameFirst) {
    const name = nameFirst[1]!.trim();
    const content = nameFirst[2]!.trim();
    if (!name || !content) return null;
    return { provider: inferProvider(name), name, content };
  }

  const contentFirst = trimmed.match(META_CONTENT_NAME_REGEX);
  if (contentFirst) {
    const content = contentFirst[1]!.trim();
    const name = contentFirst[2]!.trim();
    if (!name || !content) return null;
    return { provider: inferProvider(name), name, content };
  }

  if (defaultProvider) {
    return {
      provider: defaultProvider,
      name: DEFAULT_META_NAME_BY_PROVIDER[defaultProvider],
      content: trimmed,
    };
  }

  return null;
}

/**
 * Merges provider-specific verification inputs into a single tags array.
 * Empty input removes the tag for that provider.
 */
export function buildVerificationMetaTags(input: {
  googleInput?: string | null;
  bingInput?: string | null;
  existing?: SiteVerificationMetaTag[];
}): SiteVerificationMetaTag[] {
  const others = (input.existing ?? []).filter((tag) => tag.provider === "other");
  const tags: SiteVerificationMetaTag[] = [...others];

  const google = input.googleInput?.trim();
  if (google) {
    const parsed = parseVerificationMetaInput(google, "google");
    if (parsed) tags.push(parsed);
  }

  const bing = input.bingInput?.trim();
  if (bing) {
    const parsed = parseVerificationMetaInput(bing, "bing");
    if (parsed) tags.push(parsed);
  }

  return tags;
}

/**
 * Finds a stored verification tag for a known provider.
 */
export function getVerificationTagByProvider(
  tags: SiteVerificationMetaTag[],
  provider: "google" | "bing",
): SiteVerificationMetaTag | undefined {
  return tags.find((tag) => tag.provider === provider);
}

/**
 * Formats a stored tag as a copy-pasteable meta element for the settings UI.
 */
export function formatVerificationMetaTag(tag: SiteVerificationMetaTag): string {
  return `<meta name="${tag.name}" content="${tag.content}" />`;
}
