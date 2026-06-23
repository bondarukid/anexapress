import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/admin";
import type { PlatformStats } from "@/types/platform-stats";

const EMPTY_STATS: PlatformStats = {
  users: 0,
  workspaces: 0,
};

/**
 * Fetches platform-wide SaaS counters via service role (bypasses RLS).
 * Used for the public landing page — guests cannot query these tables directly.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = await createAdminClient();

    const [usersResult, workspacesResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("workspaces").select("*", { count: "exact", head: true }),
    ]);

    if (usersResult.error) {
      console.error("[getPlatformStats] profiles count failed:", usersResult.error.message);
      return EMPTY_STATS;
    }

    if (workspacesResult.error) {
      console.error(
        "[getPlatformStats] workspaces count failed:",
        workspacesResult.error.message,
      );
      return EMPTY_STATS;
    }

    return {
      users: usersResult.count ?? 0,
      workspaces: workspacesResult.count ?? 0,
    };
  } catch (error) {
    console.error(
      "[getPlatformStats]",
      error instanceof Error ? error.message : "Unknown error",
    );
    return EMPTY_STATS;
  }
}

/** Cached platform stats for the landing page (revalidates every 10 minutes). */
export const getCachedPlatformStats = unstable_cache(
  getPlatformStats,
  ["platform-stats"],
  { revalidate: 600 },
);
