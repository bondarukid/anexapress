import { ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";

type RenderItemContentProps = {
  title: string;
  description?: string;
  contentClassName?: string;
  titleClassName?: string;
};

/**
 * Renders the primary title and optional description block for an item.
 */
export function RenderItemContent({
  title,
  description,
  contentClassName,
  titleClassName,
}: RenderItemContentProps) {
  return (
    <ItemContent className={contentClassName}>
      <ItemTitle className={titleClassName}>{title}</ItemTitle>
      {description ? <ItemDescription>{description}</ItemDescription> : null}
    </ItemContent>
  );
}

type RenderItemTrailingContentProps = {
  description?: string;
  className?: string;
};

/**
 * Secondary trailing content column used in image-media list rows.
 */
export function RenderItemTrailingContent({
  description,
  className,
}: RenderItemTrailingContentProps) {
  if (!description) {
    return null;
  }

  return (
    <ItemContent className={cn("flex-none text-center", className)}>
      <ItemDescription>{description}</ItemDescription>
    </ItemContent>
  );
}
