"use client";

import { AppHeader } from "@/components/layout/app-header";
import { useNotifications, useMarkNotificationRead } from "@/features/notifications/hooks";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <div>
      <AppHeader title="Notifications" />
      <div className="space-y-3 px-4 pb-8">
        {!notifications?.length ? (
          <p className="py-12 text-center text-muted-foreground">You&apos;re all caught up</p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.read_at && markRead.mutate(n.id)}
              className="w-full text-left"
            >
              <GlassCard
                className={cn(
                  "p-4",
                  !n.read_at && "ring-1 ring-[var(--accent-electric)]/30"
                )}
              >
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </GlassCard>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
