"use client";

import * as React from "react";

import { UserProfilePermissions } from "@/components/dashboard/team/member-permissions";
import {
  defaultPermissionUser,
  permissionSections,
  roleOptions,
  userProfilePermissionsDefaults,
} from "@/lib/ui/user-profile-permissions-data";

/** Developer playground wrapper with mock data for UserProfilePermissions. */
export function UserProfilePermissionsDemo() {
  const [permissionKeys, setPermissionKeys] = React.useState<Set<string>>(
    new Set(["users.view", "users.create", "org.settings", "data.read"]),
  );
  const [selectedRoleId, setSelectedRoleId] = React.useState(
    userProfilePermissionsDefaults.defaultRole,
  );

  return (
    <UserProfilePermissions
      user={defaultPermissionUser}
      sections={permissionSections}
      roles={roleOptions.map((role) => ({ value: role.value, label: role.label }))}
      selectedRoleId={selectedRoleId}
      permissionKeys={permissionKeys}
      updateLabel={userProfilePermissionsDefaults.updateLabel}
      roleTitle={userProfilePermissionsDefaults.roleTitle}
      roleDescription={userProfilePermissionsDefaults.roleDescription}
      onRoleChange={setSelectedRoleId}
      onPermissionToggle={(key, checked) => {
        setPermissionKeys((prev) => {
          const next = new Set(prev);
          if (checked) next.add(key);
          else next.delete(key);
          return next;
        });
      }}
      onSave={() => undefined}
    />
  );
}
