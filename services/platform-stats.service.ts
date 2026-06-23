import "server-only";

import { unstable_cache } from "next/cache";

import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/admin";
import type { PlatformStats } from "@/types/platform-stats";

const EMPTY_STATS: PlatformStats = {
  users: 0,
  workspaces: 0,
};

type CountResult = {
  count: number | null;
  error: { message?: string; code?: string; details?: string; hint?: string } | null;
  status?: number;
};

function formatCountError(table: string, result: CountResult): string {
  const message = result.error?.message?.trim();
  if (message) {
    return message;
  }

  const details = [result.error?.code, result.error?.details, result.error?.hint]
    .filter(Boolean)
    .join(" — ");
  if (details) {
    return details;
  }

  if (result.status === 401) {
    return "Unauthorized — check SUPABASE_SERVICE_ROLE_KEY in .env.local";
  }

  if (result.status) {
    return `HTTP ${result.status}`;
  }

  return `Failed to count ${table}`;
}

/**
 * Fetches platform-wide SaaS counters via service role (bypasses RLS).
 * Used for the public landing page — guests cannot query these tables directly.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!isSupabaseAdminConfigured()) {
    return EMPTY_STATS;
  }

  try {
    const supabase = await createAdminClient();

    const [usersResult, workspacesResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("workspaces").select("*", { count: "exact", head: true }),
    ]);

    if (usersResult.error) {
      console.error(
        "[getPlatformStats] profiles count failed:",
        formatCountError("profiles", usersResult),
      );
      return EMPTY_STATS;
    }

    if (workspacesResult.error) {
      console.error(
        "[getPlatformStats] workspaces count failed:",
        formatCountError("workspaces", workspacesResult),
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
