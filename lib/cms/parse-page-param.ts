/**
 * Parses a `page` search param into a 1-based page number.
 */
export function parsePageParam(value: string | undefined, fallback = 1): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return parsed;
}

/**
 * Clamps a page number to the valid range for a paginated result.
 */
export function clampPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}
