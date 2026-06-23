"use client";

import * as React from "react";

import { checkWorkspaceSlugAction } from "@/actions/workspace/check-slug";

type SlugCheckResult = {
  /** Trimmed slug this result was produced for. */
  slug: string;
  available: boolean | null;
  error: string | null;
};

export type SlugCheckState = {
  checking: boolean;
  available: boolean | null;
  error: string | null;
};

const IDLE_STATE: SlugCheckState = {
  checking: false,
  available: null,
  error: null,
};

/**
 * Debounced workspace slug availability check for onboarding step 3.
 *
 * State is derived during render to avoid synchronous setState in effect
 * (which triggers cascading renders). The effect only schedules a debounce
 * timer; updates happen inside the async callback.
 */
export function useWorkspaceSlugCheck(
  slug: string,
  debounceMs = 400,
  excludeWorkspaceId?: string,
  unchangedSlug?: string,
  parentWorkspaceId?: string | null,
) {
  const trimmed = slug.trim();
  const tooShort = trimmed.length < 3;
  const isUnchangedSlug =
    unchangedSlug !== undefined && trimmed.length >= 3 && trimmed === unchangedSlug.trim();

  const [result, setResult] = React.useState<SlugCheckResult | null>(null);

  React.useEffect(() => {
    if (tooShort || isUnchangedSlug) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const response = await checkWorkspaceSlugAction(
        trimmed,
        excludeWorkspaceId,
        parentWorkspaceId,
      );
      if (cancelled) return;

      setResult({
        slug: trimmed,
        available: response.error ? null : response.available,
        error: response.error ?? (response.available ? null : "This URL is already taken."),
      });
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed, tooShort, isUnchangedSlug, debounceMs, excludeWorkspaceId, parentWorkspaceId]);

  if (tooShort) {
    return IDLE_STATE;
  }

  if (isUnchangedSlug) {
    return { checking: false, available: true, error: null };
  }

  if (!result || result.slug !== trimmed) {
    return { checking: true, available: null, error: null };
  }

  return {
    checking: false,
    available: result.available,
    error: result.error,
  };
}
