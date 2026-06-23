import type { Metadata } from "next";

import { Changelog4 } from "@/components/landing/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Product updates, improvements, and fixes — shipped with dates and release notes.",
};

export default function ChangelogRoutePage() {
  return (
    <div className="flex w-full flex-1 justify-center px-4">
      <Changelog4 />
    </div>
  );
}
