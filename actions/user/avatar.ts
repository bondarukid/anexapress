// actions/avatar.ts
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/server";
import { AvatarFileSchema } from "@/schemas/user-schema";
import { removeUserAvatar, uploadUserAvatar } from "@/services/user";

export async function uploadAvatarAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Сессия истекла." };

    const parsed = AvatarFileSchema.safeParse(formData.get("avatarFile"));
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Файл не выбран.",
      };
    }

    const result = await uploadUserAvatar(user.id, parsed.data);
    if (!result.success) return result;

    revalidatePath("/", "layout");
    return { success: true, avatarUrl: result.avatarUrl };
  } catch {
    return { success: false, error: "Ошибка сервера при загрузке." };
  }
}

// Отдельный экшен для удаления аватара
export async function removeAvatarAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Сессия истекла." };

    const { error } = await removeUserAvatar(user.id);
    if (error) return { success: false, error };

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Ошибка удаления." };
  }
}
