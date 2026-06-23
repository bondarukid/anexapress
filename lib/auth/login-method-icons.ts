import { Mail } from "lucide-react";

import { GitHubIcon } from "@/components/ui/svgs/github-icon";
import { GoogleIcon } from "@/components/ui/svgs/google-icon";
import type { LoginMethodCardSnapshot, LoginMethodCardState, LoginMethodId } from "@/types/auth";

/** Brand and Lucide icons keyed by login method — client-only. */
const LOGIN_METHOD_ICONS = {
  email: { Icon: Mail, brandIcon: false },
  google: { Icon: GoogleIcon, brandIcon: true },
  github: { Icon: GitHubIcon, brandIcon: false },
} satisfies Record<LoginMethodId, { Icon: LoginMethodCardState["icon"]; brandIcon: boolean }>;

/** Attaches icons to server-fetched card snapshots for client rendering. */
export function enrichLoginMethodCards(cards: LoginMethodCardSnapshot[]): LoginMethodCardState[] {
  return cards.map((card) => {
    const { Icon, brandIcon } = LOGIN_METHOD_ICONS[card.id];
    return {
      ...card,
      icon: Icon,
      brandIcon,
    };
  });
}
