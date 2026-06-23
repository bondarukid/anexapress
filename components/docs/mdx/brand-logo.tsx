import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
};

/** Centered AnexaPress wordmark for docs hero sections. */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("not-prose my-6 flex justify-center", className)}>
      <Logo className="h-8" />
    </div>
  );
}
