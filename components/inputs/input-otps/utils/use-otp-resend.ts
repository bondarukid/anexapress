"use client";

import { useCallback, useEffect, useState } from "react";

type UseOtpResendOptions = {
  cooldownSeconds?: number;
  onResend?: () => void | Promise<void>;
  onResendComplete?: () => void;
};

/**
 * Countdown timer for OTP resend flows.
 */
export function useOtpResend({
  cooldownSeconds = 60,
  onResend,
  onResendComplete,
}: UseOtpResendOptions) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const [isResending, setIsResending] = useState(false);

  const canResend = secondsLeft <= 0 && !isResending;

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  const resetCooldown = useCallback(() => {
    setSecondsLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  const handleResend = useCallback(async () => {
    if (!canResend || !onResend) {
      return;
    }

    setIsResending(true);

    try {
      await onResend();
      onResendComplete?.();
      resetCooldown();
    } finally {
      setIsResending(false);
    }
  }, [canResend, onResend, onResendComplete, resetCooldown]);

  return {
    secondsLeft,
    canResend,
    isResending,
    handleResend,
    resetCooldown,
  };
}
