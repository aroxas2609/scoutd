"use client";

import { useState } from "react";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/features/notifications/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isPending } = useNotifications({ enabled: open });
  const recent = data?.slice(0, 5) ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-electric)] text-[9px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-white/10 bg-[var(--bg-graphite)]"
      >
        {open && isPending ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : open && recent.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No notifications yet</p>
        ) : open ? (
          recent.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
              <span className="font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.body}</span>
            </DropdownMenuItem>
          ))
        ) : null}
        <DropdownMenuItem>
          <Link href="/notifications" className="w-full text-center text-[var(--accent-electric)]">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
