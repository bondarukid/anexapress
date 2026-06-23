"use client";

import * as React from "react";

/**
 * Document scroll progress for Changelog 4 timeline fill (8% floor, 92% range).
 * Matches shadcnblocks changelog4 bundle formula.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = React.useState(8);

  React.useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const next =
        scrollable <= 0 ? 8 : Math.min((window.scrollY / scrollable) * 92 + 8, 100);
      setProgress(next);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return progress;
}
