import type { PermissionCatalogItem, PermissionSection } from "@/types/team";

/** UI grouping for workspace permission slugs from the permissions catalog. */
const PERMISSION_SECTIONS: Array<{
  category: string;
  icon: PermissionSection["icon"];
  keys: string[];
}> = [
  {
    category: "Workspace",
    icon: "building",
    keys: ["workspace.read", "workspace.update", "workspace.transfer"],
  },
  {
    category: "Members",
    icon: "users",
    keys: ["members.invite", "members.remove"],
  },
  {
    category: "Roles",
    icon: "settings",
    keys: ["roles.create", "roles.update", "roles.delete"],
  },
  {
    category: "Content",
    icon: "database",
    keys: ["content.create", "content.publish", "content.translate"],
  },
];

/**
 * Builds permission checkbox sections from the catalog returned by Supabase.
 * Unknown keys are appended to a catch-all section so new permissions still appear.
 */
export function buildPermissionSections(catalog: PermissionCatalogItem[]): PermissionSection[] {
  const byKey = new Map(catalog.map((item) => [item.key, item]));
  const usedKeys = new Set<string>();
  const sections: PermissionSection[] = [];

  for (const def of PERMISSION_SECTIONS) {
    const permissions = def.keys
      .map((key) => {
        const item = byKey.get(key);
        if (!item) return null;
        usedKeys.add(key);
        return { id: item.key, label: item.description ?? item.key };
      })
      .filter((item): item is { id: string; label: string } => item !== null);

    if (permissions.length > 0) {
      sections.push({
        category: def.category,
        icon: def.icon,
        permissions,
      });
    }
  }

  const other = catalog
    .filter((item) => !usedKeys.has(item.key))
    .map((item) => ({ id: item.key, label: item.description ?? item.key }));

  if (other.length > 0) {
    sections.push({
      category: "Other",
      icon: "settings",
      permissions: other,
    });
  }

  return sections;
}

/** Sentinel select value when effective permissions do not match any preset role. */
export const CUSTOM_ROLE_SELECT_VALUE = "__custom__";

/**
 * Returns the preset role id whose permission set matches the given keys, or null.
 */
export function findMatchingPresetRoleId(
  permissionKeys: Set<string>,
  rolePermissionKeys: Record<string, string[]>,
): string | null {
  const normalized = [...permissionKeys].sort().join("\0");

  for (const [roleId, keys] of Object.entries(rolePermissionKeys)) {
    const roleNormalized = [...keys].sort().join("\0");
    if (roleNormalized === normalized) {
      return roleId;
    }
  }

  return null;
}
