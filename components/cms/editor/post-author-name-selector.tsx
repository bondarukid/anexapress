"use client";

import { Shield, UserRound } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POST_AUTHOR_ADMIN,
  postAuthorNameForPreset,
  resolvePostAuthorPreset,
  type PostAuthorPreset,
} from "@/lib/cms/post-author";

type PostAuthorNameSelectorProps = {
  authorName: string | null;
  userDisplayName: string;
  onChange: (authorName: string) => void;
};

/**
 * Post author picker: current user display name or generic Admin label.
 */
export function PostAuthorNameSelector({
  authorName,
  userDisplayName,
  onChange,
}: PostAuthorNameSelectorProps) {
  const preset = resolvePostAuthorPreset(authorName);

  const handlePresetChange = (next: PostAuthorPreset) => {
    onChange(postAuthorNameForPreset(next, userDisplayName));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="post-author-select">Author name</Label>
        <p className="text-muted-foreground text-xs">
          Shown in the post header on the public site.
        </p>
      </div>

      <Select value={preset} onValueChange={(next) => handlePresetChange(next as PostAuthorPreset)}>
        <SelectTrigger id="post-author-select" className="w-full">
          <SelectValue placeholder="Select author" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">
            <span className="flex items-center gap-2">
              <UserRound className="text-muted-foreground size-4 shrink-0" />
              {userDisplayName}
            </span>
          </SelectItem>
          <SelectItem value="admin">
            <span className="flex items-center gap-2">
              <Shield className="text-muted-foreground size-4 shrink-0" />
              {POST_AUTHOR_ADMIN}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
