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
      <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
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
