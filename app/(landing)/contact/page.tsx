import type { Metadata } from "next";

import Contact from "@/components/contact/contactform";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-12 lg:py-16">
      <Contact />
    </div>
  );
}
