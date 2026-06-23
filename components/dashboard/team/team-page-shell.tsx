import type { ReactNode } from "react";

type TeamPageShellProps = {
  children: ReactNode;
};

export function TeamPageShell({ children }: TeamPageShellProps) {
  return (
    <div className="bg-background min-h-screen p-6 md:p-10">
      <section className="py-3">
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    </div>
  );
}
