import type {
  BaseDrawerProps,
  DrawerFileNode,
  DrawerNavGroup,
  DrawerNavItem,
} from "@/components/drawers/types/drawer.types";

export type LeftDrawerVariant =
  | "simple"
  | "navigationMenu"
  | "nestedItems"
  | "withSearch"
  | "fileExplorer";

export type LeftDrawerProps = BaseDrawerProps & {
  variant?: LeftDrawerVariant;
  bodyText?: string;
  navItems?: DrawerNavItem[];
  nestedNavGroups?: DrawerNavGroup[];
  fileNodes?: DrawerFileNode[];
  searchPlaceholder?: string;
};
