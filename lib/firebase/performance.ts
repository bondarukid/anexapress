import { trace, type PerformanceTrace } from "firebase/performance";

import { getPerformanceClient } from "./client";

/**
 * Starts a custom Performance Monitoring trace by name.
 *
 * Returns the started {@link PerformanceTrace}, or `null` when monitoring is
 * unavailable (server-side render or missing Firebase config). Always pair with
 * `stopTrace` (or call `.stop()` directly) to record the duration.
 *
 * @param name - Stable trace name shown in the Firebase console (e.g. `supabase-user-query`).
 *
 * @example
 * const t = startTrace("supabase-user-query");
 * const { data } = await supabase.from("users").select("*");
 * stopTrace(t);
 */
export function startTrace(name: string): PerformanceTrace | null {
  const perf = getPerformanceClient();
  if (!perf) {
    return null;
  }

  const customTrace = trace(perf, name);
  customTrace.start();
  return customTrace;
}

/**
 * Stops a previously started trace, recording its duration. No-op for `null`.
 *
 * @param customTrace - The trace returned by {@link startTrace}, or `null`.
 */
export function stopTrace(customTrace: PerformanceTrace | null): void {
  customTrace?.stop();
}

/**
 * Measures the duration of an async operation under a custom trace.
 *
 * Wraps {@link startTrace} / {@link stopTrace} so the trace is always stopped,
 * even when the operation throws. When monitoring is unavailable the operation
 * still runs untraced.
 *
 * @param name - Stable trace name shown in the Firebase console.
 * @param operation - The async work to measure.
 *
 * @returns The resolved value of `operation`.
 *
 * @example
 * const data = await measureTrace("supabase-user-query", async () => {
 *   const { data } = await supabase.from("users").select("*");
 *   return data;
 * });
 */
export async function measureTrace<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  const customTrace = startTrace(name);
  try {
    return await operation();
  } finally {
    stopTrace(customTrace);
  }
}
