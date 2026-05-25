"use client";

import { BrandHeader } from "@/components/brand/brand-header";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bg-deep)]/75 lg:pt-0">
      <div className="flex items-start justify-between gap-4 px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <BrandHeader
            href="/search"
            variant="icon"
            size="sm"
            className="mt-0.5 shrink-0 lg:hidden"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 lg:hidden">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
