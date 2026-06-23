/**
 * Tab content for Feature 211 on `/features`.
 * Emissions accounting product highlights.
 */

import { ClipboardList, FileCheck, Shield, Users } from "lucide-react";

import type { Feature211Tab } from "@/types/feature211";

const ASSETS = "/reference/feature211/assets";

export const feature211Tabs: Feature211Tab[] = [
  {
    icon: ClipboardList,
    title: "Emissions inventory",
    tabName: "Inventory",
    summary:
      "Capture emission sources, activity data, and factors in one structured workspace — ready for review and export.",
    imageComponent: "1",
    images: [{ src: `${ASSETS}/placeholder-dark-1.svg`, alt: "" }],
  },
  {
    icon: FileCheck,
    title: "Reporting and compliance",
    tabName: "Reporting",
    summary:
      "Prepare audit-ready records with consistent methodology, versioning, and workspace-level controls for regulated reporting.",
    imageComponent: "2",
    link: { name: "Read the docs", href: "/docs" },
    images: [
      { src: `${ASSETS}/placeholder-dark-1.svg`, alt: "" },
      { src: `${ASSETS}/placeholder-dark-2.svg`, alt: "" },
      { src: `${ASSETS}/placeholder-dark-3.svg`, alt: "" },
      { src: `${ASSETS}/placeholder-dark-4.svg`, alt: "" },
    ],
  },
  {
    icon: Users,
    title: "Team access",
    tabName: "Team access",
    summary:
      "Invite analysts, reviewers, and admins with role-based permissions — everyone works from the same emissions dataset.",
    imageComponent: "3",
    link: { name: "Learn about teams", href: "/docs/workspaces/team" },
    images: [{ src: `${ASSETS}/placeholder-dark-1.svg`, alt: "" }],
  },
  {
    icon: Shield,
    title: "Workspace audit trail",
    tabName: "Audit trail",
    summary:
      "Keep workspace settings, member changes, and access policies traceable — built for teams that need accountability.",
    imageComponent: "4",
    link: { name: "Security overview", href: "/help#security" },
    images: [
      { src: `${ASSETS}/placeholder-dark-1.svg`, alt: "" },
      { src: `${ASSETS}/placeholder-dark-2.svg`, alt: "" },
      { src: `${ASSETS}/placeholder-dark-3.svg`, alt: "" },
    ],
  },
];
