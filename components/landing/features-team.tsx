import { ClipboardList, Lock, Users } from "lucide-react";
import Image from "next/image";

export default function FeaturesTeamSection() {
  return (
    <section className="overflow-hidden py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-semibold lg:text-5xl">Built for cross-functional teams</h2>
          <p className="mt-6 text-lg">
            Sustainability analysts, facility managers, and finance teams collaborate in one
            workspace — with clear roles and shared emissions records.
          </p>
        </div>
        <div className="relative -mx-4 mask-b-from-75% mask-b-to-95% mask-l-from-75% mask-l-to-95% pt-3 pr-3 md:-mx-12">
          <div className="perspective-midrange">
            <div className="rotate-x-6 -skew-2">
              <div className="relative aspect-88/36">
                <Image
                  src="/mail-upper.png"
                  className="absolute inset-0 z-10"
                  alt="Team collaboration in workspace dashboard"
                  width={2797}
                  height={1137}
                />
                <Image
                  src="/mail-back.png"
                  className="hidden dark:block"
                  alt="Team collaboration in workspace dashboard dark"
                  width={2797}
                  height={1137}
                />
                <Image
                  src="/mail-back-light.png"
                  className="dark:hidden"
                  alt="Team collaboration in workspace dashboard light"
                  width={2797}
                  height={1137}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4" />
              <h3 className="text-sm font-medium">Structured data</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Keep sources, factors, and activity data organized per workspace.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <h3 className="text-sm font-medium">Shared workspace</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Invite teammates with roles that match how your organization reports emissions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              <h3 className="text-sm font-medium">Access control</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Permission-based access keeps sensitive emissions data within the right teams.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4" />
              <h3 className="text-sm font-medium">Reporting-ready</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Foundation for audit trails and compliance exports as modules roll out.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
