import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type IconInputGroupProps = Omit<ComponentProps<typeof InputGroupInput>, "className"> & {
  icon: LucideIcon;
  className?: string;
  inputClassName?: string;
};

/**
 * Input with leading icon using InputGroup primitives.
 */
export function IconInputGroup({
  icon: Icon,
  className,
  inputClassName,
  ...inputProps
}: IconInputGroupProps) {
  return (
    <InputGroup className={cn("bg-background", className)}>
      <InputGroupAddon align="inline-start">
        <Icon />
      </InputGroupAddon>
      <InputGroupInput className={cn("bg-background", inputClassName)} {...inputProps} />
    </InputGroup>
  );
}
