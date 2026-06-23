import type { InfoHoverCardProps } from "@/components/hover-cards/types";

/**
 * Kibo UI info hover card pattern presets.
 */
export const infoPresets = {
  simpleInfo: {
    variant: "simpleInfo",
    description: "Storage limit: 10 GB per workspace.",
  },
  withTitle: {
    variant: "withTitle",
    title: "API Rate Limits",
    description: "Free: 100 req/min · Pro: 1,000 req/min · Enterprise: unlimited.",
  },
  withIconAndBadge: {
    variant: "withIconAndBadge",
    badgeLabel: "Beta",
    title: "Early Access",
    description: "This feature is available to beta users only.",
  },
  warningInfo: {
    variant: "warningInfo",
    title: "Deprecation Notice",
    description: "This endpoint will be removed in v3. Migrate before June 2026.",
  },
  technicalInfo: {
    variant: "technicalInfo",
    title: "List Users",
    method: "GET",
    endpoint: "/api/v1/users",
    authNote: "Requires Bearer token in Authorization header.",
  },
} satisfies Record<string, Partial<InfoHoverCardProps>>;
