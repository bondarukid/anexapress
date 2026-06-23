"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DeleteAccountOptionsSchema } from "@/schemas/user-schema";
import { deleteUserAccount } from "@/services/user";
import type { DeleteAccountResponse } from "@/types/user";

export type { DeleteAccountResponse } from "@/types/user";

export async function deleteAccountAction(options?: {
  deleteSoloWorkspaces?: boolean;
}): Promise<DeleteAccountResponse> {
  const parsed = DeleteAccountOptionsSchema.safeParse(options ?? {});
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const result = await deleteUserAccount({
    deleteSoloWorkspaces: parsed.data.deleteSoloWorkspaces ?? false,
  });

  if (!result.success) return result;

  revalidatePath("/", "layout");
  redirect("/login");
}
