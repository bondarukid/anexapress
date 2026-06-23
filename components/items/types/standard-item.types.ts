import type { BaseItemData } from "@/components/items/types/item.types";

export type StandardItemVariant = "basic" | "mediaAndIcon";

export type StandardItemProps = BaseItemData & {
  variant?: StandardItemVariant;
  containerClassName?: string;
};
