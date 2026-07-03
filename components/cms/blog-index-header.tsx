import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BlogIndexHeaderProps = {
  heading: string;
  tagline?: string | null;
  description?: string | null;
  className?: string;
};

/**
 * Centered hero block shared by the public blog index and dashboard posts list.
 */
export function BlogIndexHeader({
  heading,
  tagline,
  description,
  className,
}: BlogIndexHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      {tagline ? (
        <Badge variant="secondary" className="mb-4">
          {tagline}
        </Badge>
      ) : null}
      <h1 className="mb-3 text-4xl tracking-tighter text-pretty md:mb-4 lg:max-w-3xl lg:text-5xl">
        {heading}
      </h1>
      {description ? (
        <p className="text-muted-foreground mb-8 md:text-base lg:max-w-2xl lg:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
