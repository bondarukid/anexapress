export type HelpCategoryId =
  | "getting-started"
  | "workspaces"
  | "billing"
  | "reporting"
  | "account"
  | "security";

export type HelpCategory = {
  id: HelpCategoryId;
  title: string;
  description: string;
  articles: number;
};

export type PopularTopic = {
  title: string;
  href: string;
};

export type SupportTicketCategoryId = "general" | "billing" | "technical" | "account";

export type SupportTicketCategory = {
  id: SupportTicketCategoryId;
  label: string;
};

export type SupportTicketPriorityId = "low" | "medium" | "high" | "urgent";

export type SupportTicketPriority = {
  id: SupportTicketPriorityId;
  label: string;
  isUrgent?: boolean;
};

export type SupportTicketData = {
  email: string;
  category: SupportTicketCategoryId;
  priority: SupportTicketPriorityId;
  subject: string;
  description: string;
  files: File[];
};
