import Image from "next/image";
import { GalleryVerticalEndIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-12 [&_svg]:size-5",
  lg: "size-15 [&_svg]:size-6",
} as const;

const SIZE_PX = {
  sm: 32,
  md: 48,
  lg: 60,
} as const;

export type WorkspaceLogoMarkProps = {
  logoUrl?: string | null;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

/**
 * Workspace avatar used in the sidebar switcher and branding settings.
 * Shows the uploaded logo or the default gallery icon on sidebar-primary background.
 */
export function WorkspaceLogoMark({
  logoUrl,
  name,
  size = "sm",
  className,
}: WorkspaceLogoMarkProps) {
  const boxClassName = cn(
    "relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg",
    SIZE_CLASSES[size],
    !logoUrl && "bg-sidebar-primary text-sidebar-primary-foreground",
    className,
  );

  if (logoUrl) {
    return (
      <div className={boxClassName}>
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes={`${SIZE_PX[size]}px`}
          className="object-cover"
          unoptimized={logoUrl.startsWith("blob:")}
        />
      </div>
    );
  }

  return (
    <div className={boxClassName}>
      <GalleryVerticalEndIcon />
    </div>
  );
}
