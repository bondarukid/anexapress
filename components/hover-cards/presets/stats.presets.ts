import type { StatsHoverCardProps } from "@/components/hover-cards/types";

/**
 * Kibo UI stats hover card pattern presets.
 */
export const statsPresets = {
  simpleStats: {
    variant: "simpleStats",
    primaryLabel: "Total Revenue",
    primaryValue: 48200,
    breakdown: [
      { label: "Today", value: 1240 },
      { label: "This week", value: 8900 },
      { label: "This month", value: 32100 },
    ],
  },
  growthStats: {
    variant: "growthStats",
    primaryLabel: "Monthly Active Users",
    primaryValue: 8432,
    trend: "+12.5%",
    trendDirection: "up",
    statItems: [
      { label: "New users", value: 342 },
      { label: "Churned", value: 28 },
    ],
  },
  userStats: {
    variant: "userStats",
    primaryLabel: "Active users",
    primaryValue: 8432,
    statItems: [
      { label: "Online now", value: 1247 },
      { label: "Peak today", value: 2103 },
    ],
  },
  performanceStats: {
    variant: "performanceStats",
    primaryLabel: "System Performance",
    performanceItems: [
      { label: "CPU Usage", value: "42%", percentage: 42 },
      { label: "Memory", value: "68%", percentage: 68 },
      { label: "Uptime", value: "99.9%", percentage: 99 },
    ],
  },
  financialStats: {
    variant: "financialStats",
    primaryLabel: "Monthly Recurring Revenue",
    primaryValue: 125000,
    currency: "USD",
    statItems: [
      { label: "ARR", value: "$1.5M" },
      { label: "Churn", value: "2.1%" },
    ],
  },
} satisfies Record<string, Partial<StatsHoverCardProps>>;
