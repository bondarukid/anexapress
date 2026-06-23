import type { ReactNode } from "react";

import FooterSection from "@/components/landing/footer";
import LandingMeteorsBackground from "@/components/landing/meteors-background";
import LandingHeader from "@/components/landing/landing-header";

/**
 * Route group `(landing)` is omitted from URLs: `/`, `/about`, `/pricing`, etc.
 * `main` is a column flex so child pages can `flex-1` + `justify-center` (e.g. Contact).
 *
 * Meteor background: client layer below `z-10` content so nav/footer stay clickable/readable.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <LandingMeteorsBackground />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <LandingHeader />
        <main className="structure-blocks relative flex min-h-0 flex-1 flex-col">{children}</main>
        <FooterSection />
      </div>
    </div>
  );
}
