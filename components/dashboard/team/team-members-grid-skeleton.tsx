import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TEAM_MEMBERS_SKELETON_ROW_COUNT } from "@/lib/team/constants";
import { cn } from "@/lib/utils";

type TeamMembersGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function TeamMembersGridSkeleton({
  count = TEAM_MEMBERS_SKELETON_ROW_COUNT,
  className,
}: TeamMembersGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="gap-0 p-0">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
