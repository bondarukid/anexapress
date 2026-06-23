"use client";

import Image from "next/image";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, getCountryFlagUrl, normalizeCountryCode } from "@/lib/countries";
import { cn } from "@/lib/utils";

export type CountrySelectProps = {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (isoCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** When false, only the select is rendered (useful inside custom form layouts). */
  showLabel?: boolean;
};

type CountryFlagProps = {
  isoCode: string;
  className?: string;
};

/**
 * Rectangular flag thumbnail loaded from ISO alpha-2 code via flag CDN.
 */
export function CountryFlag({ isoCode, className }: CountryFlagProps) {
  const flagUrl = getCountryFlagUrl(isoCode);

  if (!flagUrl) {
    return <span aria-hidden className={cn("bg-muted inline-block h-4 w-6 shrink-0", className)} />;
  }

  return (
    <Image
      src={flagUrl}
      alt=""
      aria-hidden
      width={24}
      height={16}
      className={cn("border-border/50 h-4 w-6 shrink-0 border object-cover", className)}
    />
  );
}

function CountryOption({ isoCode, name }: { isoCode: string; name: string }) {
  return (
    <span className="flex items-center gap-2">
      <CountryFlag isoCode={isoCode} />
      <span className="truncate">{name}</span>
    </span>
  );
}

/**
 * Shared country picker for onboarding and profile settings.
 * Persists ISO 3166-1 alpha-2 codes (e.g. `US`, `DE`) — never full country names.
 */
export function CountrySelect({
  id = "country",
  label = "Country",
  value,
  onChange,
  placeholder = "Select a country",
  disabled = false,
  className,
  showLabel = true,
}: CountrySelectProps) {
  const normalizedValue = normalizeCountryCode(value);
  // Radix Select must stay controlled for its lifetime — never pass `undefined` as value.
  const selectValue = normalizedValue ?? "";

  function handleChange(nextValue: string) {
    const isoCode = normalizeCountryCode(nextValue);
    if (isoCode) onChange(isoCode);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? <Label htmlFor={id}>{label}</Label> : null}
      <Select value={selectValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className="w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code} textValue={country.name}>
              <CountryOption isoCode={country.code} name={country.name} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
