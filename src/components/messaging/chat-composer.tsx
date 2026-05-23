"use client";

import { Send } from "lucide-react";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function ChatComposer({ value, onChange, onSubmit, disabled }: ChatComposerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] border-t border-white/[0.06] bg-[var(--bg-deep)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-lg gap-2 px-4 py-3">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Message"
          aria-label="Message text"
          className="min-h-11 flex-1 rounded-xl border border-white/[0.1] bg-[var(--bg-graphite)] px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[var(--accent-brand)]/40 focus:ring-2 focus:ring-[var(--accent-brand)]/15"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-900 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
