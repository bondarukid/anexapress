import type { PreviewHoverCardProps } from "@/components/hover-cards/types";

/**
 * Kibo UI preview hover card pattern presets.
 */
export const previewPresets = {
  linkPreview: {
    variant: "linkPreview",
    previewTitle: "Building Scalable React Applications",
    previewDescription: "Learn patterns for structuring large React codebases with TypeScript.",
    domain: "example.com",
    href: "https://example.com/article",
  },
  documentPreview: {
    variant: "documentPreview",
    previewTitle: "Q4 Report",
    filename: "q4-report-2025.pdf",
    fileType: "PDF Document",
    fileSize: "2.4 MB",
    modifiedAt: "Jan 15, 2026",
  },
  imagePreview: {
    variant: "imagePreview",
    previewTitle: "dashboard-screenshot.png",
    filename: "dashboard-screenshot.png",
    imageDimensions: "1920 × 1080",
    imageFormat: "PNG",
    fileSize: "845 KB",
  },
  eventPreview: {
    variant: "eventPreview",
    previewTitle: "Product Launch Webinar",
    previewDescription: "Join us for a walkthrough of emissions reporting workflows.",
    eventDate: "Mar 15, 2026",
    eventTime: "2:00 PM EST",
    eventLocation: "Online · Zoom",
  },
  productPreview: {
    variant: "productPreview",
    previewTitle: "Wireless Headphones Pro",
    previewDescription: "Active noise cancellation with 30-hour battery life.",
    price: "$299",
    salePrice: "$249",
    rating: 4.8,
    inStock: true,
  },
} satisfies Record<string, Partial<PreviewHoverCardProps>>;
