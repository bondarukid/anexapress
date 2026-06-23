"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { SocialPlatformIcon } from "@/components/landing/social";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { changelogReleases } from "@/lib/changelog/content";
import { cn } from "@/lib/utils";
import type { ChangelogGroup, ChangelogRelease } from "@/types/changelog";

type Changelog4Props = {
  className?: string;
};

function ChangelogProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full text-base leading-relaxed",
        "[&_h2]:text-4xl [&_h2]:font-bold [&_h2]:tracking-tight",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_p]:text-muted-foreground [&_p]:leading-relaxed",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        "[&_li]:text-muted-foreground [&_li]:leading-relaxed [&_li]:marker:text-muted-foreground",
        "[&_b]:text-foreground [&_b]:font-semibold",
        "[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TimelineNode() {
  return (
    <span className="bg-background absolute top-2 hidden size-5 -translate-x-1/2 place-items-center rounded-full border md:-left-12 md:grid lg:-left-[55px]">
      <span className="bg-primary size-2 rounded-full" />
    </span>
  );
}

function ChangelogReleaseGroups({ groups }: { groups: ChangelogGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.heading}>
          <h3>{group.heading}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={`${group.heading}-${item.title}`}>
                <b>{item.title}</b> - {item.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function ChangelogReleasePost({ release }: { release: ChangelogRelease }) {
  return (
    <div className="relative">
      <TimelineNode />
      <Image
        src={release.heroImage}
        alt={release.title}
        width={1024}
        height={576}
        className="border-border aspect-video w-full rounded-md border object-cover"
        priority={release.id === changelogReleases[0]?.id}
      />
      <div className="my-4 flex items-center gap-2">
        <Avatar className="border-border size-8 rounded-full border">
          <AvatarImage src={release.avatarImage} alt="BondaStefLab SaaS Team" />
        </Avatar>
        <time className="text-muted-foreground text-sm" dateTime={release.dateTime}>
          {release.date}
        </time>
      </div>
      <ChangelogProse>
        <h2 className="text-4xl">{release.title}</h2>
        <p>
          {release.intro}
          {release.introEmphasis ? <b>{release.introEmphasis}</b> : null}
          {release.introTrailing ?? null}
        </p>
        <ChangelogReleaseGroups groups={release.groups} />
        {release.footerLink ? (
          <p>
            <Link href={release.footerLink.href}>{release.footerLink.label}</Link>
          </p>
        ) : null}
      </ChangelogProse>
    </div>
  );
}

export function Changelog4({ className }: Changelog4Props) {
  const progress = useScrollProgress();

  return (
    <section className={cn("mx-auto w-full max-w-5xl py-32 md:px-10", className)}>
      <div className="flex w-full flex-col gap-16">
        <h1 className="text-5xl font-bold">Changelog</h1>

        <div className="bg-muted mx-auto flex w-full items-center justify-center gap-2 rounded-2xl p-3 md:gap-4">
          <Link href="#" aria-label="Facebook">
            <SocialPlatformIcon
              platformId="facebook"
              className="text-muted-foreground hover:text-primary size-6 duration-150"
            />
          </Link>
          <Link href="#" aria-label="X">
            <SocialPlatformIcon
              platformId="x"
              className="text-muted-foreground hover:text-primary size-6 duration-150"
            />
          </Link>
          <Link href="#" aria-label="Instagram">
            <SocialPlatformIcon
              platformId="instagram"
              className="text-muted-foreground hover:text-primary size-6 duration-150"
            />
          </Link>
          <p className="text-muted-foreground text-sm">
            Follow us and stay up to date with everything we&apos;re on!
          </p>
        </div>

        <div className="relative space-y-20">
          <div className="absolute top-4 hidden h-full w-0.5 md:-left-12 md:block lg:-left-14">
            <div className="bg-muted h-full w-full rounded-full">
              <div
                className="relative max-h-full w-full rounded-full bg-linear-to-b from-primary/20 via-primary/40 to-primary transition-all duration-300"
                style={{ height: `${progress}%` }}
              />
            </div>
          </div>

          {changelogReleases.map((release) => (
            <ChangelogReleasePost key={release.id} release={release} />
          ))}
        </div>
      </div>
    </section>
  );
}
