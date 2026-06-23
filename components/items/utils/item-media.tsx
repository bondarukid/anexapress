import type { ItemMediaConfig } from "@/components/items/types/item.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ItemMedia } from "@/components/ui/item";
import { cn } from "@/lib/utils";

type RenderItemMediaProps = {
  media?: ItemMediaConfig;
  className?: string;
};

/**
 * Renders icon, avatar, or image media inside ItemMedia.
 */
export function RenderItemMedia({ media, className }: RenderItemMediaProps) {
  if (!media) {
    return null;
  }

  if (media.type === "icon") {
    const Icon = media.icon;
    return (
      <ItemMedia className={className} variant={media.variant ?? "icon"}>
        <Icon className={media.iconClassName} />
      </ItemMedia>
    );
  }

  if (media.type === "avatar") {
    return (
      <ItemMedia className={className}>
        <Avatar className={cn("size-10", media.className)}>
          {media.src ? <AvatarImage alt={media.fallback} src={media.src} /> : null}
          <AvatarFallback>{media.fallback}</AvatarFallback>
        </Avatar>
      </ItemMedia>
    );
  }

  return (
    <ItemMedia className={className} variant="image">
      {/* Kibo patterns use plain img for framework-agnostic examples */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={media.alt ?? ""}
        className={media.className}
        height={media.height}
        src={media.src}
        width={media.width}
      />
    </ItemMedia>
  );
}
