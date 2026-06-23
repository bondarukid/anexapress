export type PermissionUser = {
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

export type PermissionItem = {
  id: string;
  label: string;
};

export type PermissionSectionIcon = "users" | "building" | "database" | "settings";

export type PermissionSection = {
  category: string;
  icon: PermissionSectionIcon;
  permissions: PermissionItem[];
};

export type RoleOption = {
  value: string;
  label: string;
};

export type AccessHistoryEntry = {
  action: string;
  by: string;
  date: string;
};

export const defaultPermissionUser: PermissionUser = {
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
  avatar: "https://github.com/shadcn.png",
};

export const permissionSections: PermissionSection[] = [
  {
    category: "User Management",
    icon: "users",
    permissions: [
      { id: "users.view", label: "View users" },
      { id: "users.create", label: "Create users" },
      { id: "users.edit", label: "Edit users" },
      { id: "users.delete", label: "Delete users" },
    ],
  },
  {
    category: "Organization",
    icon: "building",
    permissions: [
      { id: "org.settings", label: "Manage organization settings" },
      { id: "org.billing", label: "Access billing" },
      { id: "org.teams", label: "Manage teams" },
    ],
  },
  {
    category: "Data Access",
    icon: "database",
    permissions: [
      { id: "data.read", label: "Read data" },
      { id: "data.write", label: "Write data" },
      { id: "data.delete", label: "Delete data" },
      { id: "data.share", label: "Share data" },
    ],
  },
  {
    category: "System Settings",
    icon: "settings",
    permissions: [
      { id: "settings.view", label: "View settings" },
      { id: "settings.edit", label: "Edit settings" },
      { id: "settings.security", label: "Manage security" },
    ],
  },
];

export const roleOptions: RoleOption[] = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
  { value: "custom", label: "Custom" },
];

export const accessHistory: AccessHistoryEntry[] = [
  {
    action: "Role changed to Administrator",
    by: "Sarah Chen",
    date: "2 hours ago",
  },
  {
    action: "Added Data Management permissions",
    by: "Mike Wilson",
    date: "1 day ago",
  },
  {
    action: "Removed Billing access",
    by: "System Audit",
    date: "3 days ago",
  },
];

export const userProfilePermissionsDefaults = {
  updateLabel: "Update Permissions",
  roleTitle: "Role Assignment",
  roleDescription: "Select a predefined role or customize permissions below",
  historyTitle: "Recent Access Changes",
  defaultRole: "admin",
};
