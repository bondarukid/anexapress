const readBool = (value: string | undefined): boolean => value === "true";

/**
 * When false: only one workspace per user (additional creation blocked server-side).
 * UI hides "Add workspace" in team switcher.
 */
export const ENABLE_MULTI_WORKSPACE =
  readBool(process.env.ENABLE_MULTI_WORKSPACE) ||
  readBool(process.env.NEXT_PUBLIC_ENABLE_MULTI_WORKSPACE);

/**
 * When false: only one site per workspace (default `main` site).
 * UI hides "New site" and redirects Sites list to default site.
 */
export const ENABLE_MULTI_SITE =
  readBool(process.env.ENABLE_MULTI_SITE) ||
  readBool(process.env.NEXT_PUBLIC_ENABLE_MULTI_SITE);
