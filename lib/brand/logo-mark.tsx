import type { ReactNode } from "react";

/** “B” overlaid on the stack — tuned for vertical opacity blend. */
export const LOGO_B_PATH =
  "M9.5 6.85H16.75C19.55 6.85 21.5 8.55 21.5 11.05C21.5 12.65 20.65 13.95 19.35 14.65C21.05 15.35 22.2 16.85 22.2 18.85C22.2 21.65 19.95 23.85 16.85 23.85H9.5V6.85ZM12.4 13.55H16.45C17.85 13.55 18.75 12.75 18.75 11.45C18.75 10.15 17.85 9.35 16.45 9.35H12.4V13.55ZM12.4 21.35H16.95C18.45 21.35 19.35 20.45 19.35 18.95C19.35 17.45 18.45 16.55 16.95 16.55H12.4V21.35Z";

type LogoMarkProps = {
  gradientId: string;
  uniColor?: boolean;
};

/**
 * Three stacked layers with “B” on top — opacity gradient aligned to each band.
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

      <path fill={letterFill} fillRule="evenodd" clipRule="evenodd" d={LOGO_B_PATH} />
    </g>
  );
}
