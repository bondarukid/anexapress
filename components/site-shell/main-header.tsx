"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { resolvePageHref } from "@/lib/cms/site-mappers";
import type { HeaderConfig } from "@/schemas/site-layout.schema";

type MainHeaderProps = {
  config: HeaderConfig;
  basePath: string;
  logoUrl?: string | null;
  usePlatformLogo?: boolean;
};

export function MainHeader({ config, basePath, logoUrl, usePlatformLogo = false }: MainHeaderProps) {
  const [menuState, setMenuState] = useState(false);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href={config.logo.href ?? basePath}
                aria-label="home"
                className="flex items-center space-x-2"
              >
                {usePlatformLogo ? (
                  <Logo />
                ) : logoUrl ? (
                  <Image src={logoUrl} alt={config.logo.text} width={120} height={32} className="h-8 w-auto" />
                ) : (
                  <span className="text-lg font-semibold">{config.logo.text}</span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
              </button>
            </div>

            <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {config.nav.map((item) => (
                    <li key={`${item.pageSlug}-${item.label}`}>
                      <Link
                        href={resolvePageHref(basePath, item.pageSlug)}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                {config.cta ? (
                  <Button asChild size="sm">
                    <Link href={resolvePageHref(basePath, config.cta.pageSlug)}>
                      {config.cta.label}
                    </Link>
                  </Button>
                ) : null}
                {config.showAuthLinks ? (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/login?mode=signup">Sign up</Link>
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
