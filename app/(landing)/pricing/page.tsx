import type { Metadata } from "next";
import PricingSection from "@/components/pricing/pricings";

export const metadata: Metadata = {
  title: "Pricing",
};

/** Placeholder route — flesh out UI later; layout still provides header/footer. */
export default function PricingPage() {
  return (
    <div className="items-center justify-center px-4 py-12 lg:py-16">
      <PricingSection />
    </div>
  );
}
