"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { enUS as dateFnsEnUS } from "date-fns/locale/en-US";
import { enUS } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type BirthDatePickerProps = {
  id?: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function parseBirthDate(value?: string) {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

export function BirthDatePicker({
  id = "date-of-birth",
  label = "Date of birth",
  value,
  onChange,
  placeholder = "Select date of birth",
}: BirthDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseBirthDate(value);
  const today = React.useMemo(() => new Date(), []);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {selectedDate ? format(selectedDate, "PPP", { locale: dateFnsEnUS }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Calendar
            locale={enUS}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            captionLayout="dropdown"
            defaultMonth={selectedDate ?? new Date(1995, 0)}
            startMonth={new Date(1940, 0)}
            endMonth={today}
            disabled={{ after: today }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
