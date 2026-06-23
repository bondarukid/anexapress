import { withSentryConfig } from "@sentry/nextjs";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

function supabaseStorageRemotePattern(): { protocol: "https"; hostname: string } | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  try {
    return { protocol: "https", hostname: new URL(supabaseUrl).hostname };
  } catch {
    return null;
  }
}

const supabaseStoragePattern = supabaseStorageRemotePattern();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    // Firebase (web) — used client-side for Performance Monitoring.
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    // GlitchTip (Sentry-compatible) DSN — exposed to the browser so the client SDK can report errors.
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN,
    // Feature flags — client UI gating (server may also set ENABLE_* without NEXT_PUBLIC_).
    NEXT_PUBLIC_ENABLE_MULTI_WORKSPACE:
      process.env.NEXT_PUBLIC_ENABLE_MULTI_WORKSPACE ?? process.env.ENABLE_MULTI_WORKSPACE,
    NEXT_PUBLIC_ENABLE_MULTI_SITE:
      process.env.NEXT_PUBLIC_ENABLE_MULTI_SITE ?? process.env.ENABLE_MULTI_SITE,
  },
  // Keep source maps after build so withSentryConfig can upload them to GlitchTip for readable stack traces.
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "cdn.shadcnstudio.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseStoragePattern ? [supabaseStoragePattern] : []),
      { protocol: "https", hostname: "*.mzstatic.com" },
    ],
  },
};

export default withSentryConfig(withMDX(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "ivan-bondaruk",

  project: "bondasteflab-saas",
  sentryUrl: "https://glitchtip.bondarukid.com/",

  // Build-time token used only to upload source maps to GlitchTip (generate in your GlitchTip profile).
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js proxy, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
