import type { Metadata } from "next";

import { Feature211, Feature250, Feature299 } from "@/components/landing/features";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore BondaStefLab SaaS product capabilities with interactive feature highlights.",
};

export default function FeaturesPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-0 px-4">
      <Feature211 />
      <Feature250 />
      <Feature299 />
    </div>
  );
}
