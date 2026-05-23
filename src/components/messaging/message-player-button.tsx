"use client";

import { MessageCircle } from "lucide-react";
import { startConversation } from "@/features/messaging/actions";
import { profileActionClass } from "@/components/profile/player-profile-action-styles";
import { cn } from "@/lib/utils";

type MessagePlayerButtonProps = {
  playerId: string;
  layout?: "default" | "profile";
};

export function MessagePlayerButton({
  playerId,
  layout = "default",
}: MessagePlayerButtonProps) {
  const isProfile = layout === "profile";

  return (
    <form
      action={startConversation.bind(null, playerId)}
      className={cn(isProfile ? "min-w-0" : "min-w-0 flex-1")}
    >
      <button
        type="submit"
        className={cn(
          isProfile
            ? profileActionClass("secondary")
            : "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[var(--bg-surface)] text-sm font-medium transition-colors hover:bg-white/[0.06] active:scale-[0.99]"
        )}
      >
        <MessageCircle
          className={cn(
            "text-[var(--accent-brand)]",
            isProfile ? "h-[18px] w-[18px]" : "h-4 w-4"
          )}
        />
        Message
      </button>
    </form>
  );
}
