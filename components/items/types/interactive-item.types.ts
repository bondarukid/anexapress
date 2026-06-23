import type { BaseItemData } from "@/components/items/types/item.types";

export type InteractiveItemVariant = "link" | "linkExternal" | "dropdown";

export type InteractiveDropdownItem = BaseItemData & {
  id: string;
  onSelect?: () => void;
};

export type InteractiveItemProps = BaseItemData & {
  variant?: InteractiveItemVariant;
  containerClassName?: string;
  triggerLabel?: string;
  dropdownItems?: InteractiveDropdownItem[];
  onSelect?: (id: string) => void;
  dropdownContentClassName?: string;
  dropdownAlign?: "start" | "center" | "end";
};
