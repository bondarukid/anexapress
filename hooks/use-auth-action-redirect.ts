"use client";

import { useEffect } from "react";

import type { AuthActionState } from "@/types/auth";

/**
 * Navigates after auth server actions return `redirectTo`.
 * Uses full page navigation so Supabase session cookies from the action are applied reliably.
 */
export function useAuthActionRedirect(state: AuthActionState) {
  useEffect(() => {
    if (state?.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state?.redirectTo]);
}
