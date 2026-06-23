"use client";

import { MainHeader } from "@/components/site-shell/main-header";

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
        logo: { text: "BondasteFlab", href: "/" },
        nav: LANDING_NAV,
        showAuthLinks: true,
      }}
      basePath=""
      usePlatformLogo
    />
  );
}
