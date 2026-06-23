/**
 * Copy for Feature 299 on `/features` — emissions infrastructure map.
 */

import { Box, FileSpreadsheet, Globe, ShieldUser, User, Users } from "lucide-react";

import type { Feature299Pillar, Feature299SafariConfig } from "@/types/feature299";

export const feature299Intro =
  "Understand how your emissions data flows. See sources, methodologies, and reporting paths in one view. Track these components of your accounting system:";

export const feature299Pillars: Feature299Pillar[] = [
  { title: "Emission sources (sites, facilities, fleets)", icon: Globe },
  { title: "Activity data (fuel, energy, production)", icon: User },
  { title: "Emission factors and methodologies", icon: Box },
  { title: "Reports and regulatory submissions", icon: FileSpreadsheet },
  { title: "Roles, policies, and access control", icon: ShieldUser },
  { title: "Multi-workspace collaboration", icon: Users },
];

export const feature299Safari: Feature299SafariConfig = {
  url: "https://bondasteflab.com",
  mode: "simple",
  imageSrc: "/reference/feature299/assets/browser-mockup.png",
};
