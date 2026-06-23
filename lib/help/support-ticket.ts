/**
 * Support ticket form copy and options for Help Center dialog.
 *
 * Edit categories, priorities, and defaults here — consumed by `SupportTicketForm`.
 */

import type { SupportTicketCategory, SupportTicketPriority } from "@/types/help";

export const supportTicketDefaults = {
  title: "Submit a support ticket",
  description: "Describe your issue and we'll get back to you.",
};

export const supportTicketCategories: SupportTicketCategory[] = [
  { id: "general", label: "General" },
  { id: "billing", label: "Billing" },
  { id: "technical", label: "Technical" },
  { id: "account", label: "Account" },
];

export const supportTicketPriorities: SupportTicketPriority[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent", isUrgent: true },
];

export const supportTicketAttachmentConstraints = {
  maxFiles: 5,
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedExtensions: [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".doc", ".docx", ".txt"],
};

export const supportTicketAttachmentHint =
  "You can attach up to 5 files, 10 MB each. Supported formats: PDF, PNG, JPG, GIF, DOC, DOCX, TXT.";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
