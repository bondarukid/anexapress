"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  RefreshCwIcon,
} from "lucide-react";

import { InputGroupButton } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type InputGroupSendButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  srLabel?: string;
};

export function InputGroupSendButton({
  className,
  disabled,
  onClick,
  srLabel = "Send",
}: InputGroupSendButtonProps) {
  return (
    <InputGroupButton
      className={cn("rounded-full", className)}
      disabled={disabled}
      onClick={onClick}
      size="icon-xs"
      type="button"
      variant="default"
    >
      <ArrowUpIcon />
      <span className="sr-only">{srLabel}</span>
    </InputGroupButton>
  );
}

type InputGroupCopyButtonProps = {
  ariaLabel?: string;
  className?: string;
  copied?: boolean;
  defaultCopied?: boolean;
  onCopiedChange?: (copied: boolean) => void;
  onCopy?: () => void;
  resetMs?: number;
};

export function InputGroupCopyButton({
  ariaLabel = "Copy",
  className,
  copied: copiedProp,
  defaultCopied = false,
  onCopiedChange,
  onCopy,
  resetMs = 2000,
}: InputGroupCopyButtonProps) {
  const [internalCopied, setInternalCopied] = useState(defaultCopied);
  const copied = copiedProp ?? internalCopied;

  useEffect(() => {
    if (!copied || copiedProp !== undefined) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setInternalCopied(false);
      onCopiedChange?.(false);
    }, resetMs);

    return () => window.clearTimeout(timeoutId);
  }, [copied, copiedProp, onCopiedChange, resetMs]);

  const handleCopy = () => {
    if (copiedProp === undefined) {
      setInternalCopied(true);
    }
    onCopiedChange?.(true);
    onCopy?.();
  };

  return (
    <InputGroupButton
      aria-label={ariaLabel}
      className={className}
      onClick={handleCopy}
      size="icon-xs"
      type="button"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </InputGroupButton>
  );
}

type InputGroupPasswordActionsProps = {
  className?: string;
  onRegenerate?: () => void;
  onVisibleChange?: (visible: boolean) => void;
  regenerateAriaLabel?: string;
  visible?: boolean;
  visibleAriaLabel?: string;
};

export function InputGroupPasswordActions({
  className,
  onRegenerate,
  onVisibleChange,
  regenerateAriaLabel = "Regenerate password",
  visible: visibleProp,
  visibleAriaLabel = "Toggle password visibility",
}: InputGroupPasswordActionsProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const visible = visibleProp ?? internalVisible;

  const toggleVisible = () => {
    const nextVisible = !visible;
    if (visibleProp === undefined) {
      setInternalVisible(nextVisible);
    }
    onVisibleChange?.(nextVisible);
  };

  return (
    <>
      <InputGroupButton
        aria-label={visibleAriaLabel}
        className={className}
        onClick={toggleVisible}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </InputGroupButton>
      {onRegenerate ? (
        <InputGroupButton
          aria-label={regenerateAriaLabel}
          onClick={onRegenerate}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <RefreshCwIcon />
        </InputGroupButton>
      ) : null}
    </>
  );
}

type InputGroupFavoriteButtonProps = {
  ariaLabel?: string;
  className?: string;
  favorited?: boolean;
  onFavoritedChange?: (favorited: boolean) => void;
};

export function InputGroupFavoriteButton({
  ariaLabel = "Favorite",
  className,
  favorited: favoritedProp,
  onFavoritedChange,
}: InputGroupFavoriteButtonProps) {
  const [internalFavorited, setInternalFavorited] = useState(false);
  const favorited = favoritedProp ?? internalFavorited;

  const toggleFavorited = () => {
    const nextFavorited = !favorited;
    if (favoritedProp === undefined) {
      setInternalFavorited(nextFavorited);
    }
    onFavoritedChange?.(nextFavorited);
  };

  return (
    <InputGroupButton
      aria-label={ariaLabel}
      className={className}
      onClick={toggleFavorited}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      <HeartIcon className={cn("size-4", favorited ? "fill-current" : undefined)} />
    </InputGroupButton>
  );
}
