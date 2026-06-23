"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { UpdatePasswordFormSchema } from "@/schemas/auth-schema";
import { changeUserPassword } from "@/services/user";

export async function updatePasswordAction(prevState: unknown, formData: FormData) {
  const parsed = UpdatePasswordFormSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: "Unauthorized." };
  }

  const result = await changeUserPassword({
    email: user.email,
    currentPassword: parsed.data.currentPassword,
    newPassword: parsed.data.newPassword,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath("/", "layout");
  return { success: true, error: null };
}
