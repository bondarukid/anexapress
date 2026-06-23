"use client";

import { DownloadIcon } from "lucide-react";

import { SettingsSectionLayout } from "@/components/dashboard/settings/workspace/settings-section-layout";
import { toast } from "@/components/toasts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WorkspaceDataExportSection() {
  const handleExport = () => {
    toast.info("Workspace data export is coming soon.");
  };

  return (
    <SettingsSectionLayout
      title="Data export"
      description="Download a copy of your workspace data, including members, settings, and activity logs."
    >
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium">Export workspace data</h4>
              <p className="text-muted-foreground text-sm">
                We will email you a secure download link when your export is ready. Exports typically
                complete within 24 hours.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 max-sm:w-full"
              onClick={handleExport}
            >
              <DownloadIcon />
              Export data
            </Button>
          </div>
        </CardContent>
      </Card>
    </SettingsSectionLayout>
  );
}
