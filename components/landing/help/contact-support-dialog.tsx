"use client";

import * as React from "react";

import { SupportTicketForm } from "@/components/landing/help/support-ticket-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supportTicketDefaults } from "@/lib/help/support-ticket";
import { cn } from "@/lib/utils";

const CONTACT_SUPPORT_FORM_ID = "contact-support-ticket";

export type ContactSupportDialogProps = {
  title?: string;
  description?: string;
  triggerLabel?: string;
  className?: string;
};

export function ContactSupportDialog({
  title = supportTicketDefaults.title,
  description = supportTicketDefaults.description,
  triggerLabel = "Contact Support",
  className,
}: ContactSupportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className={cn(className)}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(640px,calc(100vh-2rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="bg-muted/20 shrink-0 border-b px-6 py-5 text-left">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <SupportTicketForm
            layout="plain"
            formId={CONTACT_SUPPORT_FORM_ID}
            showFooter={false}
            onSuccess={() => setOpen(false)}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
        <DialogFooter className="bg-muted/40 mx-0 mb-0 gap-2 rounded-b-xl border-t px-6 pt-4 pb-6 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={CONTACT_SUPPORT_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
