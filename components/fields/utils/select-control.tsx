import type { FieldSelectConfig } from "@/components/fields/types/field.types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SelectControlProps = FieldSelectConfig;

/**
 * Select control with optional grouped options.
 */
export function SelectControl({
  id,
  placeholder = "Select an option",
  defaultValue,
  value,
  disabled,
  options = [],
  groups = [],
  triggerClassName,
}: SelectControlProps) {
  const hasGroups = groups.length > 0;

  return (
    <Select defaultValue={defaultValue} disabled={disabled} value={value}>
      <SelectTrigger className={cn("bg-background", triggerClassName)} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {hasGroups
          ? groups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          : options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  );
}
