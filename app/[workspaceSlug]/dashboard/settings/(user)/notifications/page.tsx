import { SettingsNotifications } from "@/components/dashboard/settings/account/notifications-settings/settings-notifications";

/**
 * `/dashboard/settings/notifications`
 *
 * Placeholder: email digests, in-app banners, webhook fan-out hooks, etc.
 */
export default function SettingsNotificationsPage() {
  return (
    <div className="items-center justify-center px-4 md:px-6 [&_section]:py-0">
      <SettingsNotifications />
    </div>
  );
}
