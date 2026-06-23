import type { ReactNode } from "react";

type SettingsSectionLayoutProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
};

/**
 * Shared 3-column settings section shell (Account Settings 03 / personal-info pattern).
 */
export function SettingsSectionLayout({
  title,
  description,
  children,
}: SettingsSectionLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="flex flex-col gap-6 lg:col-span-2">{children}</div>
    </div>
  );
}
