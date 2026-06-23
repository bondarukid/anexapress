import Link from "next/link";

import { SocialPlatformIcon } from "@/components/landing/social";
import { getFooterSocialPlatforms } from "@/lib/landing/social-platforms";
import { cn } from "@/lib/utils";

export type SocialLinksProps = {
  className?: string;
};

export function SocialLinks({ className }: SocialLinksProps) {
  const platforms = getFooterSocialPlatforms();

  if (platforms.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap justify-center gap-6 text-sm", className)}>
      {platforms.map((platform) => (
        <Link
          key={platform.id}
          href={platform.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.ariaLabel}
          className="text-muted-foreground hover:text-primary block"
        >
          <SocialPlatformIcon platformId={platform.id} className="size-6" />
        </Link>
      ))}
    </div>
  );
}
