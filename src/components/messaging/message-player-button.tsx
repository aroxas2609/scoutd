"use client";

import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { startConversation } from "@/features/messaging/actions";
import { profileActionClass } from "@/components/profile/player-profile-action-styles";
import { cn } from "@/lib/utils";

type MessagePlayerButtonProps = {
  otherUserId: string;
  layout?: "default" | "profile";
};

export function MessagePlayerButton({
  otherUserId,
  layout = "default",
}: MessagePlayerButtonProps) {
  const [pending, startTransition] = useTransition();
  const isProfile = layout === "profile";

  function handleClick() {
    startTransition(() => {
      void startConversation(otherUserId);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "touch-manipulation disabled:pointer-events-none disabled:opacity-50",
        isProfile
          ? profileActionClass("secondary")
          : "flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[var(--bg-surface)] text-sm font-medium transition-colors hover:bg-white/[0.06] active:scale-[0.99]"
      )}
    >
      <MessageCircle
        className={cn(
          "text-[var(--accent-brand)]",
          isProfile ? "h-[18px] w-[18px]" : "h-4 w-4"
        )}
      />
      {pending ? "Messaging…" : "Message"}
    </button>
  );
}
