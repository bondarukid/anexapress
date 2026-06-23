import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web SDK config, read from public env vars exposed in `next.config.ts`.
 *
 * Only values prefixed with `NEXT_PUBLIC_` are available in the browser bundle.
 * `measurementId` is optional (only required if Analytics is enabled).
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const PLACEHOLDER_PREFIX = "your-";

/**
 * Returns true when an env value is set and not a `.env.example` placeholder.
 */
function isValidFirebaseEnvValue(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    !normalized.startsWith(PLACEHOLDER_PREFIX) &&
    !normalized.includes("your-project") &&
    normalized !== "undefined"
  );
}

/**
 * Whether the minimum Firebase config required to initialize the app is present.
 * Used to avoid crashing during builds/previews where env vars are not set.
 */
export function hasFirebaseConfig(): boolean {
  const { apiKey, projectId, appId } = firebaseConfig;

  if (
    !isValidFirebaseEnvValue(apiKey) ||
    !isValidFirebaseEnvValue(projectId) ||
    !isValidFirebaseEnvValue(appId)
  ) {
    return false;
  }

  // Web API keys from Firebase console always start with this prefix.
  return apiKey.startsWith("AIza");
}
