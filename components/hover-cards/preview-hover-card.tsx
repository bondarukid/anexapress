"use client";

import {
  Calendar,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Star,
} from "lucide-react";

import type { PreviewHoverCardProps } from "@/components/hover-cards/types";
import {
  HoverCardMetaList,
  HoverCardPreviewHeader,
} from "@/components/hover-cards/utils/hover-card-layout";
import { HoverCardShell } from "@/components/hover-cards/utils/hover-card-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Preview hover card covering Kibo UI preview patterns.
 * https://www.kibo-ui.com/patterns/hover-card/preview
 */
export function PreviewHoverCard({
  variant = "linkPreview",
  trigger,
  previewTitle,
  previewDescription,
  previewImage,
  previewImageAlt,
  previewMeta,
  href,
  domain,
  filename,
  fileType,
  fileSize,
  modifiedAt,
  imageDimensions,
  imageFormat,
  eventDate,
  eventTime,
  eventLocation,
  price,
  salePrice,
  rating,
  inStock = true,
  stockLabel,
  contentClassName,
  triggerAsChild,
  ...shellProps
}: PreviewHoverCardProps) {
  const resolvedContentClassName = cn(
    (variant === "linkPreview" || variant === "imagePreview" || variant === "productPreview") &&
      "w-80",
    contentClassName,
  );

  const content = (() => {
    switch (variant) {
      case "linkPreview":
        return (
          <HoverCardPreviewHeader
            title={previewTitle}
            description={previewDescription}
            footer={
              domain ? (
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <ExternalLink className="size-3" />
                  <span>{domain}</span>
                </div>
              ) : null
            }
          />
        );

      case "documentPreview":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                <FileText className="text-muted-foreground size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{filename ?? previewTitle}</p>
                {fileType ? (
                  <p className="text-muted-foreground text-xs">{fileType}</p>
                ) : null}
              </div>
            </div>
            <HoverCardMetaList
              items={[
                ...(fileSize ? [{ label: "Size", value: fileSize }] : []),
                ...(modifiedAt ? [{ label: "Modified", value: modifiedAt }] : []),
                ...(previewMeta ?? []),
              ]}
            />
          </div>
        );

      case "imagePreview":
        return (
          <HoverCardPreviewHeader
            title={filename ?? previewTitle}
            description={previewDescription}
            image={previewImage}
            imageAlt={previewImageAlt}
            footer={
              <HoverCardMetaList
                items={[
                  ...(imageDimensions ? [{ label: "Dimensions", value: imageDimensions }] : []),
                  ...(imageFormat ? [{ label: "Format", value: imageFormat }] : []),
                  ...(fileSize ? [{ label: "Size", value: fileSize }] : []),
                ]}
              />
            }
          />
        );

      case "eventPreview":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                <Calendar className="text-muted-foreground size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{previewTitle}</p>
                {eventDate ? (
                  <p className="text-muted-foreground text-xs">
                    {eventDate}
                    {eventTime ? ` · ${eventTime}` : ""}
                  </p>
                ) : null}
              </div>
            </div>
            {eventLocation ? (
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <MapPin className="size-3.5 shrink-0" />
                <span>{eventLocation}</span>
              </div>
            ) : null}
            {previewDescription ? (
              <p className="text-muted-foreground text-xs leading-relaxed">{previewDescription}</p>
            ) : null}
          </div>
        );

      case "productPreview":
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                <Package className="text-muted-foreground size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{previewTitle}</p>
                <div className="mt-1 flex items-center gap-2">
                  {salePrice ? (
                    <>
                      <span className="text-sm font-semibold">{salePrice}</span>
                      {price ? (
                        <span className="text-muted-foreground text-xs line-through">{price}</span>
                      ) : null}
                    </>
                  ) : price ? (
                    <span className="text-sm font-semibold">{price}</span>
                  ) : null}
                </div>
              </div>
            </div>
            {previewDescription ? (
              <p className="text-muted-foreground line-clamp-2 text-xs">{previewDescription}</p>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              {rating !== undefined ? (
                <div className="flex items-center gap-1 text-xs">
                  <Star className="size-3.5 fill-current text-amber-500" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              ) : null}
              <Badge variant={inStock ? "secondary" : "destructive"}>
                {stockLabel ?? (inStock ? "In stock" : "Out of stock")}
              </Badge>
            </div>
          </div>
        );
    }
  })();

  const resolvedTrigger = (() => {
    if (trigger) {
      return trigger;
    }

    if (variant === "linkPreview" && href) {
      return (
        <a
          href={href}
          className="underline underline-offset-4 hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {previewTitle}
        </a>
      );
    }

    return (
      <button type="button" className="text-sm font-medium underline underline-offset-4">
        {previewTitle}
      </button>
    );
  })();

  return (
    <HoverCardShell
      {...shellProps}
      trigger={resolvedTrigger}
      triggerAsChild={triggerAsChild ?? (variant === "linkPreview" && Boolean(href))}
      contentClassName={resolvedContentClassName}
    >
      {content}
    </HoverCardShell>
  );
}
