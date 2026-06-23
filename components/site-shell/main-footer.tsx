import Link from "next/link";

import { SocialLinks } from "@/components/landing/footer/social-links";
import { resolvePageHref } from "@/lib/cms/site-mappers";
import type { FooterConfig } from "@/schemas/site-layout.schema";

type MainFooterProps = {
  config: FooterConfig;
  basePath: string;
  siteName: string;
  logoText?: string;
};

function resolveFooterHref(
  basePath: string,
  link: { pageSlug?: string; externalUrl?: string },
): string {
  if (link.externalUrl) return link.externalUrl;
  if (link.pageSlug) return resolvePageHref(basePath, link.pageSlug);
  return basePath;
}

export function MainFooter({ config, basePath, siteName, logoText }: MainFooterProps) {
  const copyright =
    config.copyright?.trim() ||
    `© ${new Date().getFullYear()} ${siteName}, All rights reserved`;

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href={basePath} aria-label="go home" className="block size-fit">
              <span className="text-lg font-semibold">{logoText ?? siteName}</span>
            </Link>
            {config.tagline ? (
              <p className="text-muted-foreground mt-3 text-sm">{config.tagline}</p>
            ) : null}
          </div>

          {config.columns.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
              {config.columns.map((column) => (
                <div key={column.title} className="space-y-4 text-sm">
                  <span className="block font-medium">{column.title}</span>
                  {column.links.map((link) => (
                    <Link
                      key={`${column.title}-${link.label}`}
                      href={resolveFooterHref(basePath, link)}
                      className="text-muted-foreground hover:text-primary block duration-150"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
            {copyright}
          </span>
          {config.socials.length > 0 ? (
            <SocialLinks className="order-first md:order-last" />
          ) : null}
        </div>
      </div>
    </footer>
  );
}
