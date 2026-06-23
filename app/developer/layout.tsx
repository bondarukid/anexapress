import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import FooterSection from "@/components/landing/footer";
import LandingHeader from "@/components/landing/landing-header";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Minimal dev-only layout. Returns 404 outside development.
 */
export default function DeveloperLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background">
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <LandingHeader />
        <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
        <FooterSection />
      </div>
    </div>
  );
}
