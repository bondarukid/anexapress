"use client";

import Image from "next/image";

export function Step05Complete() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="bg-card flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl p-4">
        <div className="relative size-full">
          <Image
            src="/onboarding-complete-light.png"
            alt="Dashboard preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-lg object-contain dark:hidden"
          />
          <Image
            src="/onboarding-complete-dark.png"
            alt="Dashboard preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="hidden rounded-lg object-contain dark:block"
          />
        </div>
      </div>

      <p className="text-muted-foreground shrink-0 px-1 pb-1 text-center text-sm">
        Hit <span className="text-foreground font-semibold">Go to Dashboard</span> on the left to
        start exploring.
      </p>
    </div>
  );
}
