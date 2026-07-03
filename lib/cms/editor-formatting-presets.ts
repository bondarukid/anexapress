export type EditorColorPreset = {
  name: string;
  value: string;
};

export const EDITOR_HIGHLIGHT_COLORS: EditorColorPreset[] = [
  { name: "Default", value: "var(--novel-highlight-default)" },
  { name: "Purple", value: "var(--novel-highlight-purple)" },
  { name: "Red", value: "var(--novel-highlight-red)" },
  { name: "Yellow", value: "var(--novel-highlight-yellow)" },
  { name: "Blue", value: "var(--novel-highlight-blue)" },
  { name: "Green", value: "var(--novel-highlight-green)" },
  { name: "Orange", value: "var(--novel-highlight-orange)" },
  { name: "Pink", value: "var(--novel-highlight-pink)" },
  { name: "Gray", value: "var(--novel-highlight-gray)" },
];

export const EDITOR_TEXT_COLORS: EditorColorPreset[] = [
  { name: "Default", value: "" },
  { name: "Muted", value: "var(--muted-foreground)" },
  { name: "Accent", value: "var(--primary)" },
  { name: "Destructive", value: "var(--destructive)" },
  { name: "Success", value: "var(--success)" },
  { name: "Warning", value: "var(--warning)" },
  { name: "Info", value: "var(--info)" },
];
