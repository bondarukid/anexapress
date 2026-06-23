import Image from "next/image";

import { cn } from "@/lib/utils";

type DocsProductShotProps = {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
};

/** Product screenshot with optional caption for guide walkthroughs. */
export function DocsProductShot({
  src = "/card.png",
  alt,
  caption,
  className,
}: DocsProductShotProps) {
  return (
    <figure className={cn("not-prose my-8", className)}>
      <div className="border-border/60 overflow-hidden rounded-xl border shadow-sm">
        <Image
          src={src}
          alt={alt}
          width={1440}
          height={900}
          className="h-auto w-full dark:opacity-90"
        />
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
