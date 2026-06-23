import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TeamManagementHeaderSkeletonProps = {
  showInviteButton?: boolean;
  description?: string;
};

export function TeamManagementHeaderSkeleton({
  showInviteButton = false,
  description = "Manage your team members and their permissions.",
}: TeamManagementHeaderSkeletonProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <h3 className="font-semibold">Members</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {showInviteButton && (
        <Skeleton className={cn("h-9 w-[132px] shrink-0 rounded-md", "max-sm:w-full")} />
      )}
    </div>
  );
}
