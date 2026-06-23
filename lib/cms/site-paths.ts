/** Public URL prefix for a workspace site: `/{workspaceSlug}/{siteSlug}`. */
export function buildSiteBasePath(workspaceSlug: string, siteSlug: string): string {
  return `/${workspaceSlug}/${siteSlug}`;
}
