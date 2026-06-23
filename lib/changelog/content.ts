/**
 * Changelog releases for `/changelog`.
 *
 * Latest entry: work since commit e541d88 (8 Jun 2026).
 * Previous entry: summary of commits from initial commit through e541d88.
 */

import type { ChangelogRelease } from "@/types/changelog";

const ASSETS = "/reference/changelog4/assets";

export const changelogReleases: ChangelogRelease[] = [
  {
    id: "2026-06-21-emissions-pivot",
    date: "21 Jun 2026",
    dateTime: "2026-06-21",
    title: "Emissions SaaS pivot — legacy features removed",
    intro: "We refocused ",
    introEmphasis: "BondaStefLab SaaS",
    introTrailing:
      " on multi-tenant atmospheric emissions accounting and removed mobile-app analytics, workspace integrations, and the projects feature.",
    heroImage: `${ASSETS}/placeholder-1.svg`,
    avatarImage: `${ASSETS}/avatar-1.webp`,
    groups: [
      {
        heading: "Product focus:",
        items: [
          {
            title: "Emissions accounting positioning",
            description:
              "Landing, docs, and dashboard copy now describe workspace-based emissions tracking and compliance-ready records.",
          },
          {
            title: "Dashboard home",
            description:
              "Workspace dashboard highlights team management and workspace settings while emissions modules are in development.",
          },
        ],
      },
      {
        heading: "Removed legacy features:",
        items: [
          {
            title: "Projects and analytics",
            description:
              "Removed project routes, analytics snapshots, project integrations, and related cron jobs.",
          },
          {
            title: "Workspace integrations",
            description:
              "Removed App Store Connect and GA4 workspace OAuth flows, integration permissions, and settings UI.",
          },
          {
            title: "Mobile artifacts",
            description:
              "Removed Apple Connect helpers, encryption keys for integration tokens, and mobile-specific marketing copy.",
          },
        ],
      },
      {
        heading: "Database and account safety:",
        items: [
          {
            title: "DROP migrations",
            description:
              "New migrations drop projects, analytics, and workspace integration tables with permission cleanup.",
          },
          {
            title: "Account deletion fix",
            description:
              "Account deletion helpers no longer reference dropped integration tables.",
          },
        ],
      },
      {
        heading: "Preserved platform:",
        items: [
          {
            title: "Auth and linked accounts",
            description:
              "Email/password and Google or GitHub sign-in remain in profile settings.",
          },
          {
            title: "Workspaces and team PBAC",
            description:
              "Multi-workspace membership, invites, roles, ownership transfer, and notifications continue to work.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-06-12-team-platform",
    date: "12 Jun 2026",
    dateTime: "2026-06-12",
    title: "Team ownership, workspace routing, and landing refresh",
    intro: "We shipped a major ",
    introEmphasis: "team and platform update",
    introTrailing:
      " covering ownership transfer, safer member access, workspace-slug routing, onboarding hardening, and a rebuilt public changelog and help center.",
    heroImage: `${ASSETS}/placeholder-1.svg`,
    avatarImage: `${ASSETS}/avatar-1.webp`,
    groups: [
      {
        heading: "Team and ownership:",
        items: [
          {
            title: "Leave workspace",
            description:
              "Non-owner members can exit a workspace through a dedicated leave flow with confirmation.",
          },
          {
            title: "Ownership transfer wizard",
            description:
              "Owners initiate transfer, recipients confirm, and the handoff finalizes through guided steps.",
          },
          {
            title: "Member permissions dialog",
            description:
              "Admins manage roles and access for other members from list and grid team views.",
          },
          {
            title: "Self-access guards",
            description:
              "Users cannot change their own role or remove themselves via admin actions — leave is required.",
          },
        ],
      },
      {
        heading: "Notifications:",
        items: [
          {
            title: "Workspace transfer mail",
            description:
              "Transfer requests surface in the notifications center with accept and decline actions.",
          },
        ],
      },
      {
        heading: "Routing and workspace shell:",
        items: [
          {
            title: "Workspace-slug dashboard",
            description:
              "Dashboard routes moved under /[workspaceSlug]/dashboard with middleware entry redirects.",
          },
          {
            title: "Sidebar refactor",
            description:
              "New app sidebar, team switcher, and removal of legacy /dashboard routes.",
          },
        ],
      },
      {
        heading: "Onboarding and workspace:",
        items: [
          {
            title: "Complete onboarding flow",
            description:
              "Profile, workspace goals, and ensure-default workspace actions after signup.",
          },
          {
            title: "Workspace forms",
            description:
              "Unified create and update workspace panels with improved join and slug validation.",
          },
        ],
      },
      {
        heading: "Landing and help:",
        items: [
          {
            title: "Changelog page",
            description: "Public Changelog 4 block with timeline, social strip, and release feed.",
          },
          {
            title: "Help center",
            description: "Support categories, ticket form with attachments, and contact dialog.",
          },
        ],
      },
      {
        heading: "UI architecture:",
        items: [
          {
            title: "Input components migration",
            description: "Input groups and OTP presets moved under components/inputs/.",
          },
          {
            title: "Members grid and list",
            description: "Shared members views with grid cards, skeletons, and view toggle.",
          },
          {
            title: "Shared upload patterns",
            description: "Dropzone and profile avatar upload sheet for consistent file UX.",
          },
        ],
      },
    ],
  },
  {
    id: "2026-06-08-platform-foundation",
    date: "8 Jun 2026",
    dateTime: "2026-06-08",
    title: "Platform foundation — auth, workspaces, and invitations",
    intro: "The first production-ready ",
    introEmphasis: "BondaStefLab SaaS platform layer",
    introTrailing:
      " landed with authentication, workspaces, invitations, notifications, and observability built on Supabase and Next.js.",
    heroImage: `${ASSETS}/placeholder-2.svg`,
    avatarImage: `${ASSETS}/avatar-2.webp`,
    groups: [
      {
        heading: "Authentication and account:",
        items: [
          {
            title: "Email and password auth",
            description: "Sign up, sign in, password reset, and session handling via Supabase Auth.",
          },
          {
            title: "Google and GitHub OAuth",
            description: "Social sign-in and linked accounts in profile settings.",
          },
          {
            title: "Profile management",
            description: "Avatar upload, email view, profile updates, and account deletion.",
          },
        ],
      },
      {
        heading: "Workspaces and onboarding:",
        items: [
          {
            title: "First workspace and PBAC",
            description: "Workspace creation with light permission-based access control.",
          },
          {
            title: "Post-signup onboarding",
            description: "Guided steps for personal info, workspace setup, and first-run completion.",
          },
          {
            title: "Workspace switcher",
            description: "Create and join workspaces from the dashboard team switcher.",
          },
        ],
      },
      {
        heading: "Invitations and members:",
        items: [
          {
            title: "Invite codes and links",
            description: "OTP invite codes, shareable links, and invite landing accept flow.",
          },
          {
            title: "Members page",
            description: "Team list and grid with pending invite visibility and skeleton loading.",
          },
          {
            title: "Realtime refresh",
            description: "Pending invites update when new notification records arrive.",
          },
        ],
      },
      {
        heading: "Notifications:",
        items: [
          {
            title: "Mail center",
            description: "In-app notifications with invite accept and decline from mail display.",
          },
        ],
      },
      {
        heading: "Profile and settings:",
        items: [
          {
            title: "Linked accounts",
            description: "Google and GitHub OAuth linking in profile settings.",
          },
        ],
      },
      {
        heading: "Observability and quality:",
        items: [
          {
            title: "Sentry and Firebase",
            description: "Error monitoring with Sentry and Firebase Performance Monitoring.",
          },
          {
            title: "Alert components",
            description: "Alert and alert-dialog UI patterns plus ESLint and prod build fixes.",
          },
        ],
      },
      {
        heading: "Landing:",
        items: [
          {
            title: "Marketing pages",
            description: "Landing refresh with pricing, contact, meteor background, and changelog route.",
          },
        ],
      },
    ],
  },
];
