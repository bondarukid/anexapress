/* eslint-disable @next/next/no-img-element -- SVG placeholders match shadcnblocks feature211 bundle markup */

import type { ReactNode } from "react";

import type { Feature211Image, Feature211MediaVariant } from "@/types/feature211";
import { cn } from "@/lib/utils";

type Feature211MediaProps = {
  images: Feature211Image[];
  variant?: Feature211MediaVariant;
};

const MEDIA_ASPECT = "aspect-[0.930372149]";

const COLLAGE_POSITIONS = [
  { top: "12%", right: "36%", rotate: "2.6deg" },
  { top: "12%", right: "70%", rotate: "-2.4deg" },
  { bottom: "16%", right: "35%", rotate: "1.6deg" },
  { bottom: "15%", right: "2%", rotate: "-1.5deg" },
] as const;

function Feature211MediaFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex size-full min-w-0 items-stretch justify-end", className)}>
      {children}
    </div>
  );
}

function Feature211MediaImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={cn("block size-full object-cover object-center", className)}
      src={src}
      alt={alt}
    />
  );
}

/**
 * Per-tab media layouts for Feature 211 (4 variants from shadcnblocks bundle).
 */
export function Feature211Media({ images, variant = "1" }: Feature211MediaProps) {
  switch (variant) {
    case "1":
      return (
        <Feature211MediaFrame>
          <div
            className={cn(
              "ml-auto min-w-0 overflow-hidden rounded-tl-[0.5rem] rounded-bl-[0.5rem]",
              MEDIA_ASPECT,
              "h-full max-h-full max-w-full",
            )}
          >
            <Feature211MediaImage src={images[0]?.src ?? ""} alt={images[0]?.alt ?? ""} />
          </div>
        </Feature211MediaFrame>
      );

    case "2":
      return (
        <Feature211MediaFrame>
          <div
            className={cn(
              "relative ml-auto min-w-0 overflow-hidden rounded-[0.625rem] pr-4",
              MEDIA_ASPECT,
              "h-full max-h-full max-w-full",
            )}
          >
            {images.map((image, index) => (
              <div
                key={`img-${variant}-${index}`}
                style={{ ...COLLAGE_POSITIONS[index] }}
                className="absolute aspect-[0.845360825] w-[30%] overflow-hidden rounded-[0.5rem] shadow-md"
              >
                <Feature211MediaImage src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </Feature211MediaFrame>
      );

    case "3":
      return (
        <Feature211MediaFrame>
          <div
            className={cn(
              "relative ml-auto min-w-0 overflow-hidden rounded-[0.625rem]",
              MEDIA_ASPECT,
              "h-full max-h-full max-w-full",
            )}
          >
            <div className="absolute top-1/2 left-[5%] aspect-[1.586206897] w-[120%] max-w-none -translate-y-1/2 overflow-hidden rounded-2xl shadow-xl 2xl:right-[-22%]">
              <Feature211MediaImage src={images[0]?.src ?? ""} alt={images[0]?.alt ?? ""} />
            </div>
          </div>
        </Feature211MediaFrame>
      );

    default:
      return (
        <Feature211MediaFrame>
          <div
            className={cn(
              "ml-auto min-w-0 overflow-hidden pl-4 lg:pl-0",
              MEDIA_ASPECT,
              "h-full max-h-full max-w-full",
            )}
          >
            <div className="grid size-full grid-cols-2 grid-rows-2 gap-[3%]">
              <div className="col-start-1 col-end-2 row-start-1 row-end-2 overflow-hidden rounded-[0.625rem]">
                <Feature211MediaImage src={images[0]?.src ?? ""} alt={images[0]?.alt ?? ""} />
              </div>
              <div className="col-start-1 col-end-2 row-start-2 row-end-3 overflow-hidden rounded-[0.625rem]">
                <Feature211MediaImage src={images[1]?.src ?? ""} alt={images[1]?.alt ?? ""} />
              </div>
              <div className="col-start-2 col-end-3 row-start-1 row-end-3 overflow-hidden rounded-tl-[0.625rem] rounded-bl-[0.625rem]">
                <Feature211MediaImage src={images[2]?.src ?? ""} alt={images[2]?.alt ?? ""} />
              </div>
            </div>
          </div>
        </Feature211MediaFrame>
      );
  }
}
