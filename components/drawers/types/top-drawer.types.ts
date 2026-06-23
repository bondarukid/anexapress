import type {
  BaseDrawerProps,
  DrawerCommandItem,
  DrawerQuickAction,
} from "@/components/drawers/types/drawer.types";

export type TopDrawerVariant =
  | "simple"
  | "searchBar"
  | "notificationBanner"
  | "quickActions"
  | "commandBar";

export type TopDrawerProps = BaseDrawerProps & {
  variant?: TopDrawerVariant;
  bodyText?: string;
  searchPlaceholder?: string;
  searchResults?: string[];
  bannerMessage?: string;
  bannerTitle?: string;
  quickActions?: DrawerQuickAction[];
  commandItems?: DrawerCommandItem[];
  onSearch?: (query: string) => void;
  onBannerDismiss?: () => void;
};
