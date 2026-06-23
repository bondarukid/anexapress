import { headers } from "next/headers";

import { MainFooter } from "@/components/site-shell/main-footer";
import { SITE_NAME } from "@/lib/constants";
import { getDocsSiteUrl } from "@/lib/docs/host";
import type { FooterConfig } from "@/schemas/site-layout.schema";

const landingFooterConfig: FooterConfig = {
  tagline: undefined,
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", externalUrl: "#" },
        { label: "Solution", externalUrl: "#" },
        { label: "Customers", externalUrl: "#" },
        { label: "Pricing", externalUrl: "#" },
        { label: "Help", externalUrl: "/help" },
        { label: "Documentation", externalUrl: "__docs__" },
        { label: "Changelog", externalUrl: "/changelog" },
        { label: "About", externalUrl: "#" },
      ],
    },
    {
      title: "Solution",
      links: [
        { label: "Startup", externalUrl: "#" },
        { label: "Freelancers", externalUrl: "#" },
        { label: "Organizations", externalUrl: "#" },
        { label: "Students", externalUrl: "#" },
        { label: "Collaboration", externalUrl: "#" },
        { label: "Design", externalUrl: "#" },
        { label: "Management", externalUrl: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", externalUrl: "#" },
        { label: "Careers", externalUrl: "#" },
        { label: "Blog", externalUrl: "#" },
        { label: "Press", externalUrl: "#" },
        { label: "Contact", externalUrl: "#" },
        { label: "Help", externalUrl: "/help" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Licence", externalUrl: "#" },
        { label: "Privacy", externalUrl: "#" },
        { label: "Cookies", externalUrl: "#" },
        { label: "Security", externalUrl: "#" },
      ],
    },
  ],
  socials: [],
  copyright: `© ${new Date().getFullYear()} ${SITE_NAME}, All rights reserved`,
};

function resolveLandingFooterConfig(docsUrl: string): FooterConfig {
  return {
    ...landingFooterConfig,
    columns: landingFooterConfig.columns.map((column) => ({
      ...column,
      links: column.links.map((link) => ({
        ...link,
        externalUrl:
          link.externalUrl === "__docs__" ? docsUrl : link.externalUrl,
      })),
    })),
  };
}

export default async function FooterSection() {
  const host = (await headers()).get("host") ?? "";
  const docsUrl = getDocsSiteUrl(host);
  const config = resolveLandingFooterConfig(docsUrl);

  return (
    <MainFooter
      config={config}
      basePath="/public"
      siteName={SITE_NAME}
      logoText={SITE_NAME}
    />
  );
}
