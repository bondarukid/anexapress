import * as React from "react";

import { SkeletonList, listPresets } from "@/components/skeletons";
import { Separator } from "@/components/ui/separator";
import { TEAM_MEMBERS_SKELETON_ROW_COUNT } from "@/lib/team/constants";

type TeamMembersListSkeletonProps = {
  count?: number;
};

export function TeamMembersListSkeleton({
  count = TEAM_MEMBERS_SKELETON_ROW_COUNT,
}: TeamMembersListSkeletonProps) {
  return (
    <div>
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={index}>
          <SkeletonList {...listPresets.teamMemberRow} />
          {index < count - 1 ? <Separator className="my-0" /> : null}
        </React.Fragment>
      ))}
    </div>
  );
}
