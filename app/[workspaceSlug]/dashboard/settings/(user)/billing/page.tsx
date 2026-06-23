import { BillingSettings } from "@/components/dashboard/settings/account/billing-settings/billing-settings";

/**
 * `/dashboard/settings/billing`
 *
 * Placeholder for subscription tiers, Stripe customer portal, invoicing CSV export, etc.
 */
export default function SettingsBillingPage() {
  return (
    <div className="items-center justify-center px-4 md:px-6 [&_section]:py-0">
      <BillingSettings />
    </div>
  );
}
