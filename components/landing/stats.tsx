import { formatStatValue } from "@/lib/format-stat-value";
import { SITE_NAME } from "@/lib/constants";
import { getCachedPlatformStats } from "@/services/platform-stats.service";

const STAT_ITEMS = [
  { key: "users", label: "Registered users" },
  { key: "workspaces", label: "Teams" },
] as const;

export default async function StatsSection() {
  const stats = await getCachedPlatformStats();

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
          <h2 className="text-4xl font-semibold lg:text-5xl">{SITE_NAME} in numbers</h2>
          <p className="text-muted-foreground">
            Real-time platform growth — teams using {SITE_NAME} for emissions accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-stretch justify-center gap-0.5 md:flex-nowrap">
          {STAT_ITEMS.map((item) => (
            <div
              key={item.key}
              className="min-w-[9rem] flex-1 space-y-2 rounded-(--radius) border px-4 py-8 text-center sm:min-w-[10rem] md:py-12"
            >
              <div className="text-4xl font-bold tracking-tight md:text-5xl">
                {formatStatValue(stats[item.key])}
              </div>
              <p className="text-muted-foreground text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
