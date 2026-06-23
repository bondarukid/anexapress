import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getPerformance, type FirebasePerformance } from "firebase/performance";

import { firebaseConfig, hasFirebaseConfig } from "./config";

/**
 * Returns the singleton Firebase app instance, initializing it on first call.
 *
 * Returns `null` when required config is missing so callers can no-op safely
 * (e.g. local builds without Firebase env vars) instead of throwing.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseConfig()) {
    return null;
  }
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let performanceInstance: FirebasePerformance | null = null;

/**
 * Returns the Firebase Performance Monitoring instance (client-only).
 *
 * Performance Monitoring is a browser-only SDK, so this returns `null` when
 * called on the server or when Firebase config is unavailable. The instance is
 * memoized so repeated calls reuse the same monitor.
 *
 * Initializing the monitor enables automatic page-load and HTTP/S request
 * traces (including Supabase REST calls). For custom traces use the helpers in
 * `lib/firebase/performance.ts`.
 */
export function getPerformanceClient(): FirebasePerformance | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (performanceInstance) {
    return performanceInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    performanceInstance = getPerformance(app);
    return performanceInstance;
  } catch (error) {
    console.error("Firebase Performance Monitoring failed to initialize:", error);
    return null;
  }
}
