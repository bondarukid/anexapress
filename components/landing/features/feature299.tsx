import { headers } from "next/headers";

import { Safari } from "@/components/landing/features/safari";
import {
  feature299Intro,
  feature299Pillars,
  feature299Safari,
} from "@/lib/landing/features/feature299-content";
import { getPlatformSiteUrl } from "@/lib/platform/host";
import { cn } from "@/lib/utils";

type Feature299Props = {
  className?: string;
};

export async function Feature299({ className }: Feature299Props) {
  const host = (await headers()).get("host") ?? undefined;
  const safariUrl = getPlatformSiteUrl(host);

  return (
    <section className={cn("w-full py-32", className)}>
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 md:gap-16 md:px-10">
        <p className="mx-auto max-w-5xl text-center text-2xl md:text-4xl">{feature299Intro}</p>

        <ul className="mx-auto grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
          {feature299Pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <li key={pillar.title} className="flex gap-2">
                <Icon className="mt-1 size-4 shrink-0" />
                <h3>{pillar.title}</h3>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto w-full max-w-5xl">
          <Safari
            url={safariUrl}
            mode={feature299Safari.mode}
            imageSrc={feature299Safari.imageSrc}
          />
        </div>
      </div>
    </section>
  );
}
