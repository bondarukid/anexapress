import type { ReactNode } from "react";

import { DashboardSettingsShell } from "@/components/dashboard/dashboard-settings-shell";

/**
 * Nested layout for `/dashboard/settings`.
 *
 * Visual chrome splits by route family inside `DashboardSettingsShell`:
 * - `(user)` → underline tabs (profile-settings demo).
 * - `(saas)` → sidebar entry plus in-page underline tabs (`DashboardSettingsShell`).
 *
 * `(user)` and `(saas)` are route-group folders — they stay out of URLs.
 */
export default function DashboardSettingsLayout({ children }: { children: ReactNode }) {
  return <DashboardSettingsShell>{children}</DashboardSettingsShell>;
}
