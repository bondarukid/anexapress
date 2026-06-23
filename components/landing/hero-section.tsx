"use client";

/** Hero block only — header lives in `LandingHeader` (shared `(landing)` layout). */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export default function HeroSection() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 isolate z-2 hidden opacity-50 contain-strict lg:block"
      >
        <div className="absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        <div className="absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <section className="bg-muted/50 dark:bg-background overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 pt-28 lg:pt-24">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold text-balance md:text-5xl lg:text-6xl">
              Track Emissions With Confidence
            </h1>
            <p className="text-muted-foreground mx-auto my-8 max-w-2xl text-xl">
              Multi-tenant workspace for teams that measure, report, and reduce atmospheric
              emissions — with roles, audit-ready records, and collaboration built in.
            </p>

            <Button asChild size="lg">
              <Link href="/login?mode=signup">
                <span className="btn-label">Start Free — No Credit Card</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto 2xl:max-w-7xl">
          <div className="pl-8 perspective-distant lg:pl-44">
            <div className="rotate-x-20 skew-x-12 mask-r-from-75% mask-b-from-55% mask-b-to-100% pt-6 pl-6 lg:h-176">
              <Image
                className="rounded-(--radius) border shadow-xl dark:hidden"
                src="/card.png"
                alt={`${SITE_NAME} hero section`}
                width={2880}
                height={2074}
              />
              <Image
                className="hidden rounded-(--radius) border shadow-xl dark:block"
                src="/dark-card.webp"
                alt={`${SITE_NAME} hero section`}
                width={2880}
                height={2074}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
