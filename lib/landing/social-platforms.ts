/**
 * Single source of truth for landing social platforms.
 *
 * Toggle `showInFooter` per platform to show or hide links in the footer bar.
 */

import type { SocialPlatform } from "@/types/social-platform";

export const socialPlatforms: SocialPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    href: "https://facebook.com",
    ariaLabel: "Facebook",
    showInFooter: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    href: "https://youtube.com",
    ariaLabel: "YouTube",
    showInFooter: false,
  },
  {
    id: "x",
    name: "X",
    href: "https://x.com",
    ariaLabel: "X/Twitter",
    showInFooter: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    href: "https://instagram.com",
    ariaLabel: "Instagram",
    showInFooter: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://linkedin.com",
    ariaLabel: "LinkedIn",
    showInFooter: true,
  },
  {
    id: "threads",
    name: "Threads",
    href: "https://threads.net",
    ariaLabel: "Threads",
    showInFooter: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    href: "https://tiktok.com",
    ariaLabel: "TikTok",
    showInFooter: true,
  },
];

/**
 * Returns platforms visible in the landing footer social bar.
 */
export function getFooterSocialPlatforms(): SocialPlatform[] {
  return socialPlatforms.filter((platform) => platform.showInFooter);
}
