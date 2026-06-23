"use client";

import { MainHeader } from "@/components/site-shell/main-header";
import { SITE_NAME } from "@/lib/constants";

const LANDING_NAV = [
  { label: "Home", pageSlug: "/" },
  { label: "Features", pageSlug: "/features" },
  { label: "Pricing", pageSlug: "/pricing" },
  { label: "About", pageSlug: "/about" },
  { label: "Contact", pageSlug: "/contact" },
];

export default function LandingHeader() {
  return (
    <MainHeader
      config={{
        logo: { text: SITE_NAME, href: "/" },
        nav: LANDING_NAV,
        showAuthLinks: true,
      }}
      basePath=""
      usePlatformLogo
    />
  );
}
