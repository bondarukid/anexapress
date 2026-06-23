"use client";

import { useActionState, useState } from "react";
import { AvatarUploadField } from "@/components/shared/avatar-upload-field";
import { CountrySelect } from "@/components/shared/country-select";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/toasts";
import type { ActionResponse } from "@/actions/user/user";
import { updateProfileAction } from "@/actions/user/user";
import { removeAvatarAction, uploadAvatarAction } from "@/actions/user/avatar";
import type { UserProfile } from "@/types/user";
import { normalizeCountryCode } from "@/lib/countries";
import { getFieldLabelId } from "@/lib/ui/field-a11y";
import {
  WORKSPACE_OWNER_POSITION,
  WORKSPACE_OWNER_POSITION_LABEL,
} from "@/lib/ui/onboarding-feed-data";
import { WORKSPACE_ROLE_OPTIONS, normalizeWorkspaceRoleSlug } from "@/lib/ui/workspace-roles";
import imageCompression from "browser-image-compression";

interface PersonalInfoProps {
  initialUser: UserProfile;
  isWorkspaceOwner: boolean;
}

const PersonalInfo = ({ initialUser, isWorkspaceOwner }: PersonalInfoProps) => {
  const [preview, setPreview] = useState<string | null>(initialUser.avatarUrl || null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  // Генерируем дефолтные инициалы для Radix Fallback (например, "John Doe" -> "JD")
  const getInitials = () => {
    const first = initialUser.firstName?.charAt(0).toUpperCase() || "";
    const last = initialUser.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "U"; // 'U' как User, если имя не заполнено
  };

  // ISO alpha-2 country code from DB (legacy slug values are normalized on read).
  const [country, setCountry] = useState<string>(normalizeCountryCode(initialUser.country) ?? "");
  const [gender, setGender] = useState<string>(initialUser.gender || "");
  const [position, setPosition] = useState<string>(
    isWorkspaceOwner
      ? WORKSPACE_OWNER_POSITION
      : normalizeWorkspaceRoleSlug(initialUser.position),
  );

  // Умный вызов экшена через хук useActionState с поддержкой toast.promise
  const [, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    async (_prevState, formData) => {
      // Вшиваем в FormData дополнительные параметры для работы со Storage
      formData.append("currentAvatarUrl", initialUser.avatarUrl || "");

      // 1. Создаем обещание (Promise), которым делимся с Sonner и используем как результат.
      //    Resolves только успешным вариантом — на ошибке бросаем исключение.
      const runUpdate = async (): Promise<Extract<ActionResponse, { success: true }>> => {
        const res = await updateProfileAction(formData);

        // Если сервер вернул ошибку, мы принудительно выбрасываем исключение (throw),
        // чтобы toast.promise понял, что нужно переключиться на красный статус Error
        if (!res.success) {
          throw new Error(res.error || "Failed to update profile");
        }

        // Возвращаем ответ в случае успеха
        return res;
      };
      const updatePromise = runUpdate();

      // 2. Запускаем toast.promise и передаем туда управление визуальными состояниями
      toast.promise.track(updatePromise, {
        loading: "Saving changes...",
        // Если промис выполнился успешно — берем красивое сообщение от сервера
        success: (data) => data.message || "Changes saved successfully!",
        // Если сработал throw Error — выводим текст ошибки из Zod или БД напрямую на экран
        error: (err) => (err instanceof Error ? err.message : "Failed to update profile"),
      });

      // 3. Возвращаем результат экшена как новое состояние (или null при ошибке).
      try {
        return await updatePromise;
      } catch {
        return null;
      }
    },
    null,
  );

  const onSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", { id: "avatar-upload-error" });
      return;
    }

    setIsAvatarUploading(true);

    try {
      const options = {
        maxSizeMB: 0.9,
        alwaysKeepResolution: true,
        useWebWorker: true,
        initialQuality: 0.95,
      };

      const compressedFile = await imageCompression(file, options);

      const avatarFormData = new FormData();
      avatarFormData.append("avatarFile", compressedFile, file.name);

      const uploadPromise = async () => {
        const res = await uploadAvatarAction(avatarFormData);
        if (!res.success || !res.avatarUrl) throw new Error(res.error || "Upload failed");
        return res;
      };

      await toast.promise.track(uploadPromise(), {
        loading: "Uploading new avatar...",
        success: (data) => {
          setPreview(data.avatarUrl);
          setIsAvatarUploading(false);
          return "Avatar updated successfully!";
        },
        error: (err) => {
          setIsAvatarUploading(false);
          return err instanceof Error ? err.message : "Upload failed";
        },
      });
    } catch (err) {
      setIsAvatarUploading(false);
      toast.error(err instanceof Error ? err.message : "Error compressing image", {
        id: "avatar-upload-error",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    setIsAvatarUploading(true);

    const deletePromise = async () => {
      const res = await removeAvatarAction();
      if (!res.success) throw new Error(res.error || "Delete failed");
      return res;
    };

    await toast.promise.track(deletePromise(), {
      loading: "Removing avatar...",
      success: () => {
        setPreview(null);
        setIsAvatarUploading(false);
        return "Avatar removed!";
      },
      error: (err) => {
        setIsAvatarUploading(false);
        return err instanceof Error ? err.message : "Delete failed";
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Vertical Tabs List */}
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold">Personal Information</h3>
        <p className="text-muted-foreground text-sm">Manage your personal information and role.</p>
      </div>

      {/* Content */}
      <div className="space-y-6 lg:col-span-2">
        <form id="personal-info-form" action={formAction} className="mx-auto">
          <div className="mb-6 w-full">
            <AvatarUploadField
              label="Your Avatar"
              hint="Pick a photo up to 2MB."
              preview={preview}
              fallbackText={getInitials()}
              imageAlt="User avatar"
              disabled={isPending}
              isUploading={isAvatarUploading}
              onFileSelect={onSelect}
              onRemove={handleRemoveAvatar}
            />
          </div>
          <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="firstName" id={getFieldLabelId("firstName")}>
                First Name
              </FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={initialUser.firstName || ""}
                disabled={isPending}
                placeholder="John"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName" id={getFieldLabelId("lastName")}>
                Last Name
              </FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={initialUser.lastName || ""}
                disabled={isPending}
                placeholder="Doe"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="mobile" id={getFieldLabelId("mobile")}>
                Mobile
              </FieldLabel>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                defaultValue={initialUser.mobile || ""}
                placeholder="+1 (555) 123-4567"
                disabled={isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="country" id={getFieldLabelId("country")}>
                Country
              </FieldLabel>
              <Input type="hidden" name="country" value={country} />
              <CountrySelect
                id="country"
                showLabel={false}
                value={country}
                onChange={setCountry}
                disabled={isPending}
                placeholder="Select country"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="gender" id={getFieldLabelId("gender")}>
                Gender
              </FieldLabel>
              <Input type="hidden" name="gender" value={gender} />
              <Select value={gender} onValueChange={setGender} disabled={isPending}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="position" id={getFieldLabelId("position")}>
                Position
              </FieldLabel>
              {isWorkspaceOwner ? (
                <>
                  <Input type="hidden" name="position" value={WORKSPACE_OWNER_POSITION} />
                  <Input
                    id="position"
                    value={WORKSPACE_OWNER_POSITION_LABEL}
                    disabled
                    readOnly
                    aria-readonly
                    className="bg-muted/50"
                  />
                </>
              ) : (
                <>
                  <Input type="hidden" name="position" value={position} />
                  <Select value={position} onValueChange={setPosition} disabled={isPending}>
                    <SelectTrigger id="position" className="w-full">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {WORKSPACE_ROLE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.value === "owner"}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="company" id={getFieldLabelId("company")}>
                Company
              </FieldLabel>
              <Input
                id="company"
                name="company"
                type="text"
                defaultValue={initialUser.company || ""}
                placeholder="Tech Inc."
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
        </form>
        <div className="flex justify-end">
          <Button
            type="submit"
            form="personal-info-form" // ИСПРАВЛЕНИЕ ТУТ!
            disabled={isPending}
            className="max-sm:w-full"
          >
            {isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
