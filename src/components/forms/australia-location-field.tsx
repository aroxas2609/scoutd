"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import type { AustraliaLocationOption } from "@/lib/location/australia";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AustraliaLocationFieldProps = {
  suburb: string;
  state: string;
  postcode: string;
  onSelect: (option: AustraliaLocationOption) => void;
  onClear?: () => void;
  error?: boolean;
  className?: string;
};

export function AustraliaLocationField({
  suburb,
  state,
  postcode,
  onSelect,
  onClear,
  error,
  className,
}: AustraliaLocationFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<AustraliaLocationOption[]>([]);

  const selectedLabel =
    suburb && postcode
      ? `${suburb}, ${state} ${postcode}`.replace(/,\s+,/, ", ")
      : "";

  useEffect(() => {
    if (!selectedLabel) {
      setQuery("");
      return;
    }
    setQuery(selectedLabel);
  }, [selectedLabel]);

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/locations/australia?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as AustraliaLocationOption[];
      setOptions(Array.isArray(data) ? data : []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void search(query);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, open, search]);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (selectedLabel && value !== selectedLabel) {
      onClear?.();
    }
  }

  function pick(option: AustraliaLocationOption) {
    onSelect(option);
    setQuery(option.label);
    setOpen(false);
    setOptions([]);
  }

  return (
    <div ref={rootRef} className="relative">
      <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={listId}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Start typing suburb or postcode…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-listbox`}
        className={cn(
          "mt-0 bg-white/5 pl-9",
          error && "border-red-400/50",
          className
        )}
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}
      {open && query.length >= 2 ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-white/[0.1] bg-[var(--bg-deep)] py-1 shadow-lg"
        >
          {options.length === 0 && !loading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No suburbs found — try another spelling
            </li>
          ) : null}
          {options.map((option) => (
            <li key={option.id} role="option">
              <button
                type="button"
                className="flex w-full px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

