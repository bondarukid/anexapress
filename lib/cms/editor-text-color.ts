import type { CmsEditorInstance } from "@/types/cms-editor";

type ColorCommands = {
  setColor?: (color: string) => boolean;
  unsetColor?: () => boolean;
};

/**
 * Applies foreground text color through the Color extension commands.
 */
export function applyEditorTextColor(editor: CmsEditorInstance, color: string): void {
  const commands = editor.commands as typeof editor.commands & ColorCommands;

  if (!color) {
    commands.unsetColor?.();
    return;
  }

  commands.setColor?.(color);
}
