"use client";

import * as React from "react";

import { createEmailInviteAction } from "@/actions/invite/create-email-invite";
import { createJoinLinkAction } from "@/actions/invite/create-join-link";
import type { InviteCreatedPayload } from "@/types/invite";

type UseInviteDialogOptions = {
  workspaceId: string;
  workspaceSlug: string;
};

export function useInviteDialog({ workspaceId, workspaceSlug }: UseInviteDialogOptions) {
  const [createdPayload, setCreatedPayload] = React.useState<InviteCreatedPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const reset = React.useCallback(() => {
    setCreatedPayload(null);
  }, []);

  const inviteByEmail = React.useCallback(
    async (email: string, roleId: string) => {
      setIsSubmitting(true);
      try {
        const result = await createEmailInviteAction({
          workspaceId,
          email,
          roleId,
          workspaceSlug,
        });
        if (!result.success) {
          return { ok: false as const, error: result.error };
        }
        setCreatedPayload(result.data);
        return { ok: true as const };
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, workspaceSlug],
  );

  const createJoinLink = React.useCallback(
    async (roleId: string, expiresInDays: number) => {
      setIsSubmitting(true);
      try {
        const result = await createJoinLinkAction({
          workspaceId,
          roleId,
          workspaceSlug,
          expiresInDays,
        });
        if (!result.success) {
          return { ok: false as const, error: result.error };
        }
        setCreatedPayload(result.data);
        return { ok: true as const };
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, workspaceSlug],
  );

  return {
    createdPayload,
    isSubmitting,
    reset,
    inviteByEmail,
    createJoinLink,
  };
}
