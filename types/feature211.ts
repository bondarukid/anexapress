import type { LucideIcon } from "lucide-react";

export type Feature211MediaVariant = "1" | "2" | "3" | "4";

export type Feature211Image = {
  src: string;
  alt: string;
};

export type Feature211Link = {
  name: string;
  href: string;
};

export type Feature211Tab = {
  tabName: string;
  title: string;
  summary: string;
  imageComponent: Feature211MediaVariant;
  images: Feature211Image[];
  icon: LucideIcon;
  link?: Feature211Link;
};
