import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClipboardCheck, Leaf, Users } from "lucide-react";
import { ReactNode } from "react";

export default function Features() {
  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-balance lg:text-5xl">
            Built for emissions accounting teams
          </h2>
          <p className="mt-4">
            Structured workflows, workspace isolation, and team permissions — without spreadsheet
            chaos.
          </p>
        </div>
        <Card className="mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0">
          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Leaf className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Inventory-ready</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                Organize emission sources and activity data in workspaces designed for regulated
                reporting.
              </p>
            </CardContent>
          </div>

          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Users className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Team-controlled</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Invite reviewers and admins with role-based access — everyone works from the same
                dataset.
              </p>
            </CardContent>
          </div>

          <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <ClipboardCheck className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Audit-friendly</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Workspace settings, member access, and reporting foundations built for compliance
                workflows.
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 mask-radial-from-40% mask-radial-to-60% duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
      {children}
    </div>
  </div>
);
