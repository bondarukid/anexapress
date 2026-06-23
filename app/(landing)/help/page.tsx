import type { Metadata } from "next";

import { HelpCenter } from "@/components/landing/help";

export const metadata: Metadata = {
  title: "Help",
};

export default function HelpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] w-full flex-1 flex-col items-center justify-center px-4 py-12 lg:min-h-[calc(100dvh-5rem)] lg:py-16">
      <HelpCenter className="w-full py-0" />
    </div>
  );
}
