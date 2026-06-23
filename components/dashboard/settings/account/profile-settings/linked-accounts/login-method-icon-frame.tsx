import type { LoginMethodIcon } from "@/types/auth";

import { cn } from "@/lib/utils";

export type LoginMethodIconFrameProps = {
  Icon?: LoginMethodIcon;
  brandColor?: string;
  iconClassName?: string;
  className?: string;
};

/** Icon container for login method cards on the account settings page. */
export function LoginMethodIconFrame({
  Icon,
  brandColor,
  iconClassName,
  className,
}: LoginMethodIconFrameProps) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border",
        !brandColor && "bg-muted",
        className,
      )}
      style={brandColor ? { backgroundColor: `${brandColor}14` } : undefined}
    >
      {Icon ? <Icon className={cn("size-5", iconClassName)} aria-hidden /> : null}
    </div>
  );
}
