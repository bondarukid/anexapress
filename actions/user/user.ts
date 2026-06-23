// actions/user.ts
"use server";

import { revalidatePath } from "next/cache";

import { normalizeCountryCode } from "@/lib/countries";
import { createClient } from "@/lib/server";
import { WORKSPACE_OWNER_POSITION } from "@/lib/ui/onboarding-feed-data";
import { normalizeWorkspaceRoleSlug } from "@/lib/ui/workspace-roles";
import { UpdateProfileSchema } from "@/schemas/user-schema";
import { updateProfileColumns } from "@/services/user";
import { getUserWorkspaces } from "@/services/workspace";

// Контракт ответа: сервер четко говорит клиенту, что произошло
export type ActionResponse = { success: true; message: string } | { success: false; error: string };

export async function updateProfileAction(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    // 1. Проверка на дурака (авторизован ли)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Сессия истекла. Войдите заново." };

    const workspacesResult = await getUserWorkspaces(user.id);
    const workspaces = workspacesResult.success ? workspacesResult.workspaces : [];
    const isWorkspaceOwner = workspaces.some((workspace) => workspace.roleSlug === "owner");

    // 2. Достаем данные из формы и валидируем через Zod
    const rawPosition = String(formData.get("position") ?? "").trim();
    const positionSlug = isWorkspaceOwner
      ? WORKSPACE_OWNER_POSITION
      : normalizeWorkspaceRoleSlug(rawPosition);

    if (!isWorkspaceOwner && positionSlug === WORKSPACE_OWNER_POSITION) {
      return { success: false, error: "Выберите роль из списка" };
    }

    const validatedFields = UpdateProfileSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      company: formData.get("company"),
      position: positionSlug || undefined,
      country: normalizeCountryCode(String(formData.get("country") ?? "")),
      gender: formData.get("gender"),
      mobile: formData.get("mobile"),
    });

    if (!validatedFields.success) {
      // Отдаем первую ошибку из списка Zod
      return { success: false, error: validatedFields.error.message };
    }

    // 3. Запись в Supabase (маппим camelCase из Zod в snake_case для БД)
    const { error: dbError } = await updateProfileColumns(user.id, {
      first_name: validatedFields.data.firstName,
      last_name: validatedFields.data.lastName,
      company: validatedFields.data.company,
      position: validatedFields.data.position,
      country: validatedFields.data.country,
      gender: validatedFields.data.gender,
      mobile: validatedFields.data.mobile,
    });

    if (dbError) return { success: false, error: `Ошибка БД: ${dbError}` };

    // 4. Сброс кэша Next.js (синхронизирует имя в сайдбаре и на всех страницах мгновенно)
    revalidatePath("/", "layout");

    return { success: true, message: "Данные успешно сохранены!" };
  } catch {
    return { success: false, error: "Критическая ошибка сервера." };
  }
}
