export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  position: string | null;
  mobile: string | null;
  country: string | null;
  gender: string | null;
  avatarUrl: string | null;
  timezone: string;
  onboardingCompletedAt: string | null;
}

export interface UserCreatedAt extends UserProfile {
  createdAt: string;
}

export interface UserUpdatedAt extends UserProfile {
  updatedAt: string;
}

export interface UserAvatarURL extends UserProfile {
  avatarUrl: string;
}

export type DeleteAccountSuccess = { success: true };

export type DeleteAccountError = {
  success: false;
  error: string;
};

export type SoloOwnedWorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type DeleteAccountSoloConfirmation = {
  success: false;
  requiresSoloWorkspaceConfirmation: true;
  soloWorkspaces: SoloOwnedWorkspaceSummary[];
};

export type DeleteAccountResponse =
  | DeleteAccountSuccess
  | DeleteAccountError
  | DeleteAccountSoloConfirmation;

export type UpdateProfileTimezoneResult =
  | { success: true; timezone: string }
  | { success: false; error: string };
