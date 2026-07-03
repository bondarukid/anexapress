import type { UserProfile } from "@/types/user";

export const POST_AUTHOR_ADMIN = "Admin";

export type PostAuthorPreset = "user" | "admin";

/**
 * Display name for the signed-in user — used as the default post author label.
 */
export function formatUserDisplayName(
  user: Pick<UserProfile, "firstName" | "lastName" | "email">,
): string {
  const firstName = user.firstName?.trim() ?? "";
  const lastName = user.lastName?.trim() ?? "";

  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  return user.email;
}

/**
 * Maps stored author name to combobox preset.
 */
export function resolvePostAuthorPreset(
  authorName: string | null | undefined,
): PostAuthorPreset {
  if (authorName === POST_AUTHOR_ADMIN) {
    return "admin";
  }

  return "user";
}

/**
 * Whether the post header should use a real profile avatar (not the generic Admin label).
 */
export function isPostAuthorProfile(authorName: string | null | undefined): boolean {
  return resolvePostAuthorPreset(authorName) !== "admin";
}

/**
 * Resolves avatar URL for the post header.
 * Profile authors fall back to the user's profile avatar when no custom media is set.
 */
export function resolvePostAuthorAvatarUrl(input: {
  authorName: string | null | undefined;
  customAvatarUrl: string | null;
  profileAvatarUrl: string | null;
}): string | null {
  if (!isPostAuthorProfile(input.authorName)) {
    return input.customAvatarUrl;
  }

  return input.customAvatarUrl ?? input.profileAvatarUrl ?? null;
}

/**
 * Resolves author label shown in post header preview and on the public site.
 */
export function resolvePostAuthorName(
  authorName: string | null | undefined,
  userDisplayName: string,
): string {
  if (authorName === POST_AUTHOR_ADMIN) {
    return POST_AUTHOR_ADMIN;
  }

  return authorName?.trim() || userDisplayName;
}

/**
 * Author name stored on the post row for a combobox preset.
 */
export function postAuthorNameForPreset(
  preset: PostAuthorPreset,
  userDisplayName: string,
): string {
  return preset === "admin" ? POST_AUTHOR_ADMIN : userDisplayName;
}
