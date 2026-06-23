"use client";

import { ClipboardPasteIcon, UsersIcon } from "lucide-react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import { VariantsOtp } from "@/components/inputs/input-otps";
import { readOtpFromClipboard } from "@/components/inputs/input-otps/utils/otp-paste";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { normalizeJoinCode } from "@/lib/invites/join-code";
import { cn } from "@/lib/utils";
import { JOIN_CODE_LENGTH } from "@/types/invite";

type JoinWorkspacePanelProps = {
  joinCode: string;
  onJoinCodeChange: (code: string) => void;
  className?: string;
};

export function JoinWorkspacePanel({
  joinCode,
  onJoinCodeChange,
  className,
}: JoinWorkspacePanelProps) {
  const toast = useToast();
  const filled = joinCode.length;
  const progress = Math.round((filled / JOIN_CODE_LENGTH) * 100);

  async function handlePasteFromClipboard() {
    try {
      const normalized = await readOtpFromClipboard({
        maxLength: JOIN_CODE_LENGTH,
        transform: normalizeJoinCode,
      });

      if (normalized.length === 0) {
        toast.error("Clipboard does not contain a valid code", { id: "join-code-paste" });
        return;
      }

      onJoinCodeChange(normalized);

      if (normalized.length < JOIN_CODE_LENGTH) {
        toast.info("Code pasted — enter the remaining characters", { id: "join-code-paste" });
      }
    } catch {
      toast.error("Could not read clipboard", { id: "join-code-paste" });
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-6 px-2 py-2", className)}>
      <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
        <UsersIcon className="size-6" />
      </div>

      <div className="max-w-xs space-y-1.5 text-center">
        <p className="text-sm font-medium">Have an invite code?</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Enter the 8-character code from your team invite email or shared link.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="join-code" className="text-muted-foreground text-xs">
              Join code
            </Label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {filled}/{JOIN_CODE_LENGTH}
            </span>
          </div>
          <VariantsOtp
            id="join-code"
            variant="differentLength"
            maxLength={JOIN_CODE_LENGTH}
            value={joinCode}
            onValueChange={(value) => onJoinCodeChange(value.toUpperCase())}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            pasteTransformer={normalizeJoinCode}
            stretch
            containerClassName="gap-0"
            slotClassName="size-10 text-base font-medium sm:size-11"
          />
          <div
            className="bg-muted h-1 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bg-primary h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => void handlePasteFromClipboard()}
        >
          <ClipboardPasteIcon className="size-4" data-icon="inline-start" />
          Paste from clipboard
        </Button>
      </div>
    </div>
  );
}
