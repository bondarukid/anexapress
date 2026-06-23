import type {
  BaseDrawerProps,
  DrawerCartItem,
  DrawerFilterSection,
  DrawerFormField,
  DrawerNotificationItem,
  DrawerSettingGroup,
} from "@/components/drawers/types/drawer.types";

export type RightDrawerVariant =
  | "simple"
  | "withForm"
  | "filterPanel"
  | "settingsPanel"
  | "shoppingCart"
  | "notifications";

export type RightDrawerProps = BaseDrawerProps & {
  variant?: RightDrawerVariant;
  bodyText?: string;
  fields?: DrawerFormField[];
  filterSections?: DrawerFilterSection[];
  onSubmit?: () => void;
  settingGroups?: DrawerSettingGroup[];
  cartItems?: DrawerCartItem[];
  notifications?: DrawerNotificationItem[];
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
  onCheckout?: () => void;
};
