import type { ReactNode } from "react";

import { MainFooter } from "@/components/site-shell/main-footer";
import { MainHeader } from "@/components/site-shell/main-header";
import type { FooterConfig, HeaderConfig } from "@/schemas/site-layout.schema";

type SiteLayoutProps = {
  children: ReactNode;
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  basePath: string;
  siteName: string;
  logoUrl?: string | null;
};

export function SiteLayout({
  children,
  headerConfig,
  footerConfig,
  basePath,
  siteName,
  logoUrl,
}: SiteLayoutProps) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <MainHeader config={headerConfig} basePath={basePath} logoUrl={logoUrl} />
        <main className="structure-blocks relative flex min-h-0 flex-1 flex-col pt-16 md:pt-0">
          {children}
        </main>
        <MainFooter
          config={footerConfig}
          basePath={basePath}
          siteName={siteName}
          logoText={headerConfig.logo.text}
        />
      </div>
    </div>
  );
}
