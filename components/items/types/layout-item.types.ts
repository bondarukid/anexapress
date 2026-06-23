import type { BaseItemData } from "@/components/items/types/item.types";

export type LayoutItemVariant = "sizes" | "group" | "withHeader";

export type LayoutItemEntry = BaseItemData & {
  id?: string;
};

export type LayoutItemProps = {
  variant?: LayoutItemVariant;
  items?: LayoutItemEntry[];
  containerClassName?: string;
  groupClassName?: string;
  gridClassName?: string;
  onAction?: (id: string) => void;
};
