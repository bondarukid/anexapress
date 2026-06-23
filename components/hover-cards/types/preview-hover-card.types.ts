import type { BaseHoverCardProps, PreviewMetaItem } from "@/components/hover-cards/types/hover-card.types";

export type PreviewHoverCardVariant =
  | "linkPreview"
  | "documentPreview"
  | "imagePreview"
  | "eventPreview"
  | "productPreview";

export type PreviewHoverCardProps = BaseHoverCardProps & {
  variant?: PreviewHoverCardVariant;
  previewTitle: string;
  previewDescription?: string;
  previewImage?: string;
  previewImageAlt?: string;
  previewMeta?: PreviewMetaItem[];
  href?: string;
  domain?: string;
  filename?: string;
  fileType?: string;
  fileSize?: string;
  modifiedAt?: string;
  imageDimensions?: string;
  imageFormat?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  price?: string | number;
  salePrice?: string | number;
  rating?: number;
  inStock?: boolean;
  stockLabel?: string;
};
