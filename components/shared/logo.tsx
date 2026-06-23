"use client";

import { useId } from "react";

import { LogoMark } from "@/lib/brand/logo-mark";
import { SITE_LOGO_WORDMARK, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Monochrome fill without layer blend gradient. */
  uniColor?: boolean;
};

/**
 * Compact SVG icon for auth cards, favicons, and tight UI slots.
 */
export function LogoIcon({ className, uniColor }: LogoProps) {
  const gradientId = useId();

  return (
    <svg
      className={cn("size-6 shrink-0 text-foreground", className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={SITE_NAME}
    >
      <LogoMark gradientId={gradientId} uniColor={uniColor} />
    </svg>
  );
}

/**
 * Icon + wordmark for header, footer, and marketing surfaces.
 */
export function Logo({ className, uniColor }: LogoProps) {
  const gradientId = useId();

  return (
    <svg
      className={cn("text-foreground h-6 w-auto min-w-[13.5rem]", className)}
      viewBox="0 0 270 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={SITE_NAME}
    >
      <LogoMark gradientId={gradientId} uniColor={uniColor} />
      <text
        x="38"
        y="21.5"
        fill="currentColor"
        fontFamily="var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)"
        fontSize="14"
        fontWeight="600"
        letterSpacing="-0.03em"
      >
        {SITE_LOGO_WORDMARK}
      </text>
    </svg>
  );
}
