import { createClient } from "@/lib/server";
import { buildLoginMethodCards, type AuthIdentity } from "@/lib/auth/linked-accounts";
import type { LinkedAccountsSnapshot } from "@/types/auth";

/**
 * Fetches the current user's linked login identities from Supabase Auth
 * and builds the card snapshot for the Connect Accounts settings UI.
 */
export async function getLinkedAccountsSnapshot(): Promise<LinkedAccountsSnapshot | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: identitiesData, error: identitiesError } = await supabase.auth.getUserIdentities();

  if (identitiesError) return null;

  const identities = (identitiesData?.identities ?? []) as AuthIdentity[];

  return {
    email: user.email ?? "",
    cards: buildLoginMethodCards(identities, user.email ?? ""),
  };
}
