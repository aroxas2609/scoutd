"use client";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bg-deep)]/75 lg:pt-0">
      <div className="flex items-start justify-between gap-4 px-4 py-4 lg:px-6 lg:py-5">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="lg:hidden">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
