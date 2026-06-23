/** Strip trailing slashes so redirect comparisons match browser-normalized paths. */
export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Coerce nullable path values before regex parsing (e.g. `usePathname()` during hydration). */
export function coercePathname(pathname: string | null | undefined): string {
  return typeof pathname === "string" ? pathname : "";
}

export function isSameRedirectPath(current: string, destination: string): boolean {
  return normalizePathname(current) === normalizePathname(destination);
}
