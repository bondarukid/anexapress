import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Leaf, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE_NAME} — multi-tenant emissions accounting for teams.`,
};

const pillars = [
  {
    icon: Leaf,
    title: "Emissions-first",
    description:
      "Built for organizations that measure, report, and reduce atmospheric emissions with audit-ready records.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Each workspace is a secure home for your team, roles, and permission-based access control.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-ready foundation",
    description:
      "Structured data, member access controls, and workspace settings designed for regulated reporting workflows.",
  },
  {
    icon: Building2,
    title: "Multi-tenant by design",
    description:
      "Switch between workspaces, invite stakeholders, and keep emissions data isolated per organization.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">About {SITE_NAME}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {SITE_NAME} is a multi-tenant SaaS platform for teams that track atmospheric emissions
            in one secure workspace — with collaboration, access control, and reporting workflows
            built in from day one.
          </p>
        </div>

        <div className="grid gap-6 text-left sm:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div key={pillar.title} className="bg-card space-y-2 rounded-xl border p-5">
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-5" />
                  <h2 className="font-medium">{pillar.title}</h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-muted/50 space-y-3 rounded-xl border p-6 text-left">
          <h2 className="text-lg font-medium">What is available today</h2>
          <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
            <li>Authentication with email, Google, and GitHub sign-in</li>
            <li>Workspaces with team invites, roles, and fine-grained permissions</li>
            <li>Notifications, ownership transfer, and workspace settings</li>
            <li>Documentation, help center, and billing foundations</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            Emissions inventory modules and calculation workflows are on the roadmap — the platform
            layer is ready for your team to collaborate now.
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/login?mode=signup">
            Get started
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
