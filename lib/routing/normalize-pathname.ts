/** Strip trailing slashes so redirect comparisons match browser-normalized paths. */
export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isSameRedirectPath(current: string, destination: string): boolean {
  return normalizePathname(current) === normalizePathname(destination);
}
