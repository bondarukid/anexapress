"use client";

import { useEffect } from "react";

import { getPerformanceClient } from "@/lib/firebase/client";

/**
 * Initializes Firebase Performance Monitoring on the client.
 *
 * Mounting this once (in the root layout) is enough to enable automatic
 * page-load and HTTP/S network request traces (including Supabase REST calls).
 * It renders nothing and safely no-ops when Firebase config is missing.
 */
export function FirebasePerformanceProvider(): null {
  useEffect(() => {
    getPerformanceClient();
  }, []);

  return null;
}
