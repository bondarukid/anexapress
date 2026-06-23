import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

import type { ValidationStatus } from "@/components/inputs/types/input.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  ValidationStatus,
  { text: string; icon: typeof AlertCircle }
> = {
  error: {
    text: "text-destructive",
    icon: AlertCircle,
  },
  success: {
    text: "text-green-600 dark:text-green-400",
    icon: CheckCircle2,
  },
  warning: {
    text: "text-orange-600 dark:text-orange-400",
    icon: AlertTriangle,
  },
};

type ValidationMessageProps = {
  message: string;
  status?: ValidationStatus;
  className?: string;
};

/**
 * Single validation message row with status icon.
 */
export function ValidationMessage({
  message,
  status = "error",
  className,
}: ValidationMessageProps) {
  const Icon = STATUS_STYLES[status].icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        STATUS_STYLES[status].text,
        className,
      )}
    >
      <Icon className="size-4" />
      <span>{message}</span>
    </div>
  );
}

type ValidationMessageListProps = {
  messages: string[];
  status?: ValidationStatus;
  className?: string;
};

/**
 * Multiple validation messages stacked vertically.
 */
export function ValidationMessageList({
  messages,
  status = "error",
  className,
}: ValidationMessageListProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {messages.map((message) => (
        <ValidationMessage key={message} message={message} status={status} />
      ))}
    </div>
  );
}

type RealtimeValidationListProps = {
  rules: Array<{ text: string; valid: boolean }>;
  className?: string;
};

/**
 * Real-time validation checklist with valid/invalid icons.
 */
export function RealtimeValidationList({
  rules,
  className,
}: RealtimeValidationListProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {rules.map((rule) => (
        <div
          key={rule.text}
          className={cn(
            "flex items-center gap-2 text-sm",
            rule.valid
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground",
          )}
        >
          {rule.valid ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <X className="size-4" />
          )}
          <span>{rule.text}</span>
        </div>
      ))}
    </div>
  );
}

export const VALIDATION_INPUT_CLASSNAMES = {
  success:
    "border-green-600 bg-background focus-visible:border-green-600 focus-visible:ring-green-600/50",
  warning:
    "border-orange-600 bg-background focus-visible:border-orange-600 focus-visible:ring-orange-600/50",
} as const;
