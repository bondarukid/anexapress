/**
 * Help Center copy for `/help`.
 *
 * Edit categories, topics, and defaults here — consumed by `HelpCenter` in
 * `components/landing/help/help-center.tsx`.
 */

import type { HelpCategory, PopularTopic } from "@/types/help";

export const helpCenterDefaults = {
  title: "Help Center",
  description: "Find answers about workspaces, billing, emissions reporting, and your account.",
};

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Create an account, set up your first workspace, and invite teammates",
    articles: 8,
  },
  {
    id: "workspaces",
    title: "Workspaces",
    description: "Switch workspaces, roles, members, and team settings",
    articles: 12,
  },
  {
    id: "billing",
    title: "Billing & plans",
    description: "Subscriptions, invoices, payment methods, and upgrades",
    articles: 10,
  },
  {
    id: "reporting",
    title: "Emissions reporting",
    description: "Inventory setup, compliance records, and audit-ready exports",
    articles: 6,
  },
  {
    id: "account",
    title: "Account",
    description: "Profile, email login, linked accounts, and notifications",
    articles: 7,
  },
  {
    id: "security",
    title: "Security",
    description: "Passwords, sessions, access control, and data privacy",
    articles: 6,
  },
];

export const helpPopularTopics: PopularTopic[] = [
  { title: "How do I create a workspace?", href: "/help#getting-started" },
  { title: "Invite teammates to my workspace", href: "/help#workspaces" },
  { title: "Change or upgrade my plan", href: "/pricing" },
  { title: "Connect Google or GitHub login", href: "/help#account" },
  { title: "Prepare emissions records for audit", href: "/help#reporting" },
  { title: "Contact support", href: "/contact" },
];
