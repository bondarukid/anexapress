import { z } from "zod/v3";

/**
 * Schema for validating support ticket form submissions.
 *
 * Used in:
 * - Help Center contact support dialog (`/help`)
 * - Developer preview page
 */
export const supportTicketSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  category: z.enum(["general", "billing", "technical", "account"], {
    required_error: "Category is required",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Priority is required",
  }),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
});

export type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;
