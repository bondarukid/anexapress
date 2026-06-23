export type OnboardingStepId =
  | "personal-info"
  | "goals"
  | "workspace"
  | "notifications"
  | "complete";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  title: string;
  description: string;
};

import { FALLBACK_TIMEZONE } from "@/lib/timezone/timezone-options";

export type OnboardingFormData = {
  firstName: string;
  lastName: string;
  /** Workspace creator role — always `owner` during onboarding (not editable). */
  position: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  phoneNumber: string;
  bio: string;
  goals: string[];
  workspaceName: string;
  workspaceUrl: string;
  timezone: string;
  companySize: string;
  industry: string;
  description: string;
  notifications: {
    productUpdates: boolean;
    comments: boolean;
    mentions: boolean;
    weeklyDigest: boolean;
  };
};

export const onboardingSteps: OnboardingStepMeta[] = [
  {
    id: "personal-info",
    title: "Tell us about yourself",
    description: "A few quick questions to personalize your experience.",
  },
  {
    id: "goals",
    title: "What are your goals?",
    description: "Select what you want to accomplish with your workspace.",
  },
  {
    id: "workspace",
    title: "Configure your workspace",
    description: "Adjust the name and URL of your workspace to match your team.",
  },
  {
    id: "notifications",
    title: "Configure notifications",
    description: "Choose how you want to stay updated on activity.",
  },
  {
    id: "complete",
    title: "You're all set!",
    description: "Your workspace is ready. Start exploring and get things done.",
  },
];

/** Stored in `profiles.position` for the user who creates a workspace. */
export const WORKSPACE_OWNER_POSITION = "owner";

/** UI label for the locked onboarding position field. */
export const WORKSPACE_OWNER_POSITION_LABEL = "Owner";

/** Slugify workspace URL segment (matches step 3 input normalization). */
export function slugifyWorkspaceUrl(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/**
 * Default workspace name + slug from the user's first and last name.
 * Used when onboarding opens and while step 1 name fields are edited.
 */
export function deriveWorkspaceDefaults(
  firstName?: string,
  lastName?: string,
): Pick<OnboardingFormData, "workspaceName" | "workspaceUrl"> {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";

  let workspaceName: string;
  if (first && last) {
    workspaceName = `${first} ${last}`;
  } else if (first) {
    workspaceName = `${first}'s Workspace`;
  } else if (last) {
    workspaceName = `${last}'s Workspace`;
  } else {
    workspaceName = "My Workspace";
  }

  let workspaceUrl = slugifyWorkspaceUrl(workspaceName);
  if (workspaceUrl.length < 3) {
    workspaceUrl = slugifyWorkspaceUrl(`${workspaceName}-workspace`);
  }
  if (workspaceUrl.length < 3) {
    workspaceUrl = "my-workspace";
  }

  return { workspaceName, workspaceUrl };
}

export const defaultOnboardingFormData = (): OnboardingFormData => {
  const workspaceDefaults = deriveWorkspaceDefaults();

  return {
    firstName: "",
    lastName: "",
    position: WORKSPACE_OWNER_POSITION,
    gender: "",
    dateOfBirth: "",
    country: "",
    phoneNumber: "",
    bio: "",
    goals: [],
    workspaceName: workspaceDefaults.workspaceName,
    workspaceUrl: workspaceDefaults.workspaceUrl,
    timezone: FALLBACK_TIMEZONE,
    companySize: "",
    industry: "",
    description: "",
    notifications: {
      productUpdates: true,
      comments: true,
      mentions: true,
      weeklyDigest: false,
    },
  };
};

export const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const goalOptions = [
  {
    id: "team-collaboration",
    label: "Collaborate with my team",
    description: "Share updates and coordinate in one place.",
  },
  {
    id: "track-performance",
    label: "Track emissions performance",
    description: "Monitor trends and prepare compliance reports.",
  },
  {
    id: "automate-workflows",
    label: "Automate reporting workflows",
    description: "Streamline data collection and review cycles.",
  },
];

export const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201+", label: "201+ employees" },
];

export const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

export const notificationOptions = [
  {
    id: "productUpdates" as const,
    title: "Product updates",
    description: "News about new features and improvements.",
  },
  {
    id: "comments" as const,
    title: "Comments",
    description: "When someone comments on your posts or replies to you.",
  },
  {
    id: "mentions" as const,
    title: "Mentions",
    description: "When someone mentions you in a comment or post.",
  },
  {
    id: "weeklyDigest" as const,
    title: "Weekly digest",
    description: "A summary of activity across your workspace.",
  },
];
