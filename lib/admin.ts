// lib/admin.ts
import { createClient } from "@supabase/supabase-js";

function isPlaceholderEnvValue(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("your-") ||
    normalized.includes("your-project") ||
    normalized === "undefined"
  );
}

/** True when Supabase URL and service role key are set to real (non-example) values. */
export function isSupabaseAdminConfigured(): boolean {
  return (
    !isPlaceholderEnvValue(process.env.SUPABASE_URL) &&
    !isPlaceholderEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export async function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase Admin Environment Variables");
  }

  // Создаем чистый клиент с админскими правами bypass RLS
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
