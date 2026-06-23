import type { BaseItemData } from "@/components/items/types/item.types";

export type MediaItemVariant = "iconMedia" | "avatarMedia" | "imageMedia";

export type MediaItemProps = BaseItemData & {
  variant?: MediaItemVariant;
  items?: BaseItemData[];
  containerClassName?: string;
  groupClassName?: string;
};
