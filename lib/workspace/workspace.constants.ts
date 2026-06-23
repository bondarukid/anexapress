import { WORKSPACE_ROLE_OPTIONS } from "@/lib/ui/workspace-roles";

export const WORKSPACE_ROLE_VALUES = WORKSPACE_ROLE_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];
