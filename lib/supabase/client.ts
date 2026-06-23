import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for Realtime and client-only reads.
 * URL/key are exposed via `next.config.ts` from the same vars as the server client.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
