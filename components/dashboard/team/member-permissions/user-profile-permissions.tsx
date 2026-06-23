"use client";

import * as React from "react";
import { Building2Icon, DatabaseIcon, SettingsIcon, ShieldIcon, UsersIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOM_ROLE_SELECT_VALUE } from "@/lib/team/permission-catalog";
import { getInitials } from "@/lib/team/data";
import { cn } from "@/lib/utils";
import type { PermissionSection, PermissionSectionIcon } from "@/types/team";

const sectionIcons: Record<PermissionSectionIcon, React.ComponentType<{ className?: string }>> = {
  users: UsersIcon,
  building: Building2Icon,
  database: DatabaseIcon,
  settings: SettingsIcon,
};

export type UserProfilePermissionsUser = {
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
};

export type UserProfilePermissionsRoleOption = {
  value: string;
  label: string;
};

export type UserProfilePermissionsProps = {
  user: UserProfilePermissionsUser;
  sections: PermissionSection[];
  roles: UserProfilePermissionsRoleOption[];
  selectedRoleId: string;
  permissionKeys: Set<string>;
  isCustom?: boolean;
  readOnly?: boolean;
  isSaving?: boolean;
  updateLabel?: string;
  roleTitle?: string;
  roleDescription?: string;
  variant?: "page" | "embedded";
  className?: string;
  showVisibilityControl?: boolean;
  isPubliclyVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onRoleChange?: (roleId: string) => void;
  onPermissionToggle?: (permissionKey: string, checked: boolean) => void;
  onSave?: () => void | Promise<void>;
  showSaveButton?: boolean;
};

export function UserProfilePermissions({
  user,
  sections,
  roles,
  selectedRoleId,
  permissionKeys,
  isCustom = false,
  readOnly = false,
  isSaving = false,
  updateLabel = "Update Permissions",
  roleTitle = "Role Assignment",
  roleDescription = "Select a predefined role or customize permissions below",
  variant = "page",
  className,
  showVisibilityControl = false,
  isPubliclyVisible = true,
  onVisibilityChange,
  onRoleChange,
  onPermissionToggle,
  onSave,
  showSaveButton = true,
}: UserProfilePermissionsProps) {
  const selectValue = isCustom ? CUSTOM_ROLE_SELECT_VALUE : selectedRoleId;

  const content = (
    <div className={cn(variant === "page" ? "mx-auto max-w-4xl" : "mx-auto w-full max-w-4xl")}>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {showVisibilityControl ? (
              <div className="mt-3 flex items-center gap-2">
                <Checkbox
                  id="member-public-visibility"
                  checked={isPubliclyVisible}
                  disabled={isSaving}
                  onCheckedChange={(checked) => onVisibilityChange?.(checked === true)}
                />
                <Label htmlFor="member-public-visibility" className="text-sm font-normal">
                  Show in public member list
                </Label>
              </div>
            ) : null}
          </div>
        </div>
        {showSaveButton && !readOnly ? (
          <Button type="button" disabled={isSaving} onClick={() => void onSave?.()}>
            <ShieldIcon className="mr-2 size-4" />
            {isSaving ? "Saving…" : updateLabel}
          </Button>
        ) : null}
      </div>

      {sections.length > 0 ? (
        <>
          <Card className="mb-6 p-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{roleTitle}</h2>
                  <p className="text-muted-foreground text-sm">{roleDescription}</p>
                </div>
                <div className="w-[200px]">
                  <Select
                    value={selectValue}
                    onValueChange={(value) => onRoleChange?.(value)}
                    disabled={readOnly || isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                      {isCustom ? (
                        <SelectItem value={CUSTOM_ROLE_SELECT_VALUE} disabled>
                          Custom
                        </SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = sectionIcons[section.icon];

              return (
                <Card key={section.category} className="p-0">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Icon className="text-muted-foreground size-5" />
                      <h2 className="text-lg font-semibold">{section.category}</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {section.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={permissionKeys.has(permission.id)}
                            disabled={readOnly || isSaving}
                            onCheckedChange={(checked) =>
                              onPermissionToggle?.(permission.id, checked === true)
                            }
                          />
                          <Label htmlFor={permission.id} className="text-sm font-normal">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );

  if (variant === "embedded") {
    return <div className={cn("w-full", className)}>{content}</div>;
  }

  return (
    <section className={cn("container mx-auto w-full 2xl:max-w-[1400px]", className)}>
      {content}
    </section>
  );
}
