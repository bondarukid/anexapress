import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { WorkspacePreparingDialog } from "@/components/dashboard/workspace/workspace-preparing-dialog";
import { ToastProvider } from "@/components/providers/toast-provider";
import { FirebasePerformanceProvider } from "@/components/providers/firebase-performance-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Multi-tenant SaaS for teams tracking and reporting atmospheric emissions with secure workspaces and role-based access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ToastProvider>
          <WorkspacePreparingDialog />
          <FirebasePerformanceProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
