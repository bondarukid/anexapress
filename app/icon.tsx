import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#171717">
            <rect x="5" y="19.25" width="18" height="6.75" rx="2.15" opacity="0.26" />
            <rect x="7" y="12.85" width="18" height="6.75" rx="2.15" opacity="0.52" />
            <rect x="9" y="6.45" width="18" height="6.75" rx="2.15" opacity="0.78" />
          </g>
          <defs>
            <linearGradient
              id="brand-icon-gradient"
              x1="16"
              y1="6.5"
              x2="16"
              y2="24.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#171717" stopOpacity="0.96" />
              <stop offset="0.34" stopColor="#171717" stopOpacity="0.78" />
              <stop offset="0.58" stopColor="#171717" stopOpacity="0.56" />
              <stop offset="1" stopColor="#171717" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path
            fill="url(#brand-icon-gradient)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.5 6.85H16.75C19.55 6.85 21.5 8.55 21.5 11.05C21.5 12.65 20.65 13.95 19.35 14.65C21.05 15.35 22.2 16.85 22.2 18.85C22.2 21.65 19.95 23.85 16.85 23.85H9.5V6.85ZM12.4 13.55H16.45C17.85 13.55 18.75 12.75 18.75 11.45C18.75 10.15 17.85 9.35 16.45 9.35H12.4V13.55ZM12.4 21.35H16.95C18.45 21.35 19.35 20.45 19.35 18.95C19.35 17.45 18.45 16.55 16.95 16.55H12.4V21.35Z"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
