import { MessageCircle } from "lucide-react";

export function MessagesEmptyPane() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
        <MessageCircle className="h-7 w-7 text-[var(--accent-brand)]" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold">Select a conversation</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Choose a thread from the list to read and reply, or start a new chat from a player
        profile.
      </p>
    </div>
  );
}
