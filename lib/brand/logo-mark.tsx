import type { ReactNode } from "react";

/** “A” overlaid on the stack — tuned for vertical opacity blend. */
export const LOGO_A_PATH =
  "M10.5 23.85L16 6.85L21.5 23.85H19.1L18.15 20.2H13.85L12.9 23.85H10.5ZM14.35 17.6H17.65L16 11.8L14.35 17.6Z";

type LogoMarkProps = {
  gradientId: string;
  uniColor?: boolean;
};

/**
 * Three stacked layers with “A” on top — opacity gradient aligned to each band.
 * Shared by UI logo components and static app icons.
 */
export function LogoMark({ gradientId, uniColor }: LogoMarkProps): ReactNode {
  const letterFill = uniColor ? "currentColor" : `url(#${gradientId})`;

  return (
    <g>
      <g fill="currentColor">
        <rect x="5" y="19.25" width="18" height="6.75" rx="2.15" opacity="0.26" />
        <rect x="7" y="12.85" width="18" height="6.75" rx="2.15" opacity="0.52" />
        <rect x="9" y="6.45" width="18" height="6.75" rx="2.15" opacity="0.78" />
      </g>

      {!uniColor ? (
        <defs>
          <linearGradient
            id={gradientId}
            x1="16"
            y1="6.5"
            x2="16"
            y2="24.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="currentColor" stopOpacity="0.96" />
            <stop offset="0.34" stopColor="currentColor" stopOpacity="0.78" />
            <stop offset="0.58" stopColor="currentColor" stopOpacity="0.56" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      ) : null}

      <path fill={letterFill} fillRule="evenodd" clipRule="evenodd" d={LOGO_A_PATH} />
    </g>
  );
}
