import type { SeoFieldsInput } from "@/schemas/seo.schema";

/**
 * Normalizes SEO fields stored in a version snapshot JSON object.
 */
export function parseSeoSnapshot(snapshot: Record<string, unknown>): SeoFieldsInput {
  return {
    seoTitle: (snapshot.seoTitle as string | null) ?? null,
    seoDescription: (snapshot.seoDescription as string | null) ?? null,
    seoCanonical: (snapshot.seoCanonical as string | null) ?? null,
    seoKeywords: (snapshot.seoKeywords as string[]) ?? [],
    ogImageId: (snapshot.ogImageId as string | null) ?? null,
    usePostDescriptionForSeo: (snapshot.usePostDescriptionForSeo as boolean | undefined) ?? false,
  };
}
