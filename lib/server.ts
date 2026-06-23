import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase browser-less server client for Route Handlers, Server Components, and Server Actions.
 * Cookie reads/writes keep sessions aligned with Middleware (`updateSession`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component without mutable cookies — Middleware refresh covers it.
        }
      },
    },
  });
}
