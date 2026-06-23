import { createImageUpload, type UploadFn } from "novel";

import { uploadMediaAction } from "@/actions/media/media.actions";

/**
 * Builds a Novel-compatible image upload handler that stores files in the media library.
 */
export function createEditorImageUpload(
  workspaceId: string,
  siteId?: string | null,
): UploadFn {
  return createImageUpload({
    validateFn: (file) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image.");
      }
    },
    onUpload: async (file) => {
      const formData = new FormData();
      formData.set("workspaceId", workspaceId);
      formData.set("file", file);
      if (siteId) {
        formData.set("siteId", siteId);
      }

      const result = await uploadMediaAction(formData);
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data.media.publicUrl;
    },
  });
}
