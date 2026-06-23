import type { ProfileHoverCardProps } from "@/components/hover-cards/types";

/**
 * Kibo UI profile hover card pattern presets.
 */
export const profilePresets = {
  simpleProfile: {
    variant: "simpleProfile",
    name: "Jane Cooper",
    username: "janecooper",
    bio: "Product designer building accessible SaaS tools.",
  },
  withFollowButton: {
    variant: "withFollowButton",
    name: "Alex Rivera",
    username: "alexrivera",
    bio: "Full-stack developer. Open source contributor.",
    followLabel: "Follow",
    messageLabel: "Message",
  },
  withBadge: {
    variant: "withBadge",
    name: "Sam Chen",
    username: "samchen",
    badge: "Pro",
    badgeVariant: "secondary",
  },
  withLocation: {
    variant: "withLocation",
    name: "Morgan Lee",
    username: "morganlee",
    location: "San Francisco, CA",
    joinedAt: "March 2024",
    bio: "Building developer tools and design systems for modern web apps.",
  },
  withStats: {
    variant: "withStats",
    name: "Taylor Brooks",
    username: "taylorbrooks",
    bio: "Creator and community builder.",
    stats: [
      { label: "Posts", value: 142 },
      { label: "Followers", value: 12500 },
      { label: "Following", value: 384 },
    ],
  },
} satisfies Record<string, Partial<ProfileHoverCardProps>>;
