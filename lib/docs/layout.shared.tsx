import { SITE_NAME } from "@/lib/constants";

export function docsMetadataBase() {
  return {
    title: {
      default: `Documentation | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME} Docs`,
    },
    description: `Product documentation for ${SITE_NAME} — workspaces, emissions accounting, and platform guides.`,
  };
}
