export type SocialPlatformId =
  | "facebook"
  | "youtube"
  | "x"
  | "instagram"
  | "linkedin"
  | "threads"
  | "tiktok";

export type SocialPlatform = {
  id: SocialPlatformId;
  name: string;
  href: string;
  ariaLabel: string;
  showInFooter: boolean;
};
