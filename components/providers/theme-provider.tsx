"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wraps next-themes for React 19 / Next.js 16 compatibility.
 *
 * next-themes injects an inline `<script>` to prevent theme flash (FOUC).
 * React 19 warns when a `<script>` is rendered during client reconciliation.
 * On the server we keep the default executable script; on the client we set
 * `type="application/json"` so React treats it as a data block (no warning).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
