"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { reportUser, blockUser } from "@/features/moderation/actions";
import { toast } from "sonner";

export function ReportBlockMenu({ userId }: { userId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-11 w-11 min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-surface)] active:scale-[0.98]"
        aria-label="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[var(--bg-graphite)]">
        <DropdownMenuItem
          onClick={async () => {
            const r = await reportUser(userId, "Inappropriate content");
            if (r?.error) toast.error(r.error);
            else toast.success("Report submitted");
          }}
        >
          Report user
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            const r = await blockUser(userId);
            if (r?.error) toast.error(r.error);
            else toast.success("User blocked");
          }}
        >
          Block user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
