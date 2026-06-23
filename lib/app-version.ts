import pkg from "../package.json" with { type: "json" };

/** Semver from package.json — inlined at build time (no env indirection). */
export const SITE_VERSION = pkg.version;
