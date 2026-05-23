"use client";

import { useNotifications } from "@/features/notifications/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationDropdown() {
  const { data } = useNotifications();
  const unread = data?.filter((n) => !n.read_at).length ?? 0;
  const recent = data?.slice(0, 5) ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-electric)] text-[9px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-white/10 bg-[var(--bg-graphite)]"
      >
        {recent.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          recent.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1">
              <span className="font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.body}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuItem>
          <Link href="/notifications" className="w-full text-center text-[var(--accent-electric)]">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
