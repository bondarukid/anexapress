import type { useEditor } from "novel";

export type CmsEditorInstance = NonNullable<ReturnType<typeof useEditor>["editor"]>;
