"use client";

import { MessagePlayerButton } from "@/components/messaging/message-player-button";

export function PlayerProfilePlayerActions({ playerId }: { playerId: string }) {
  return (
    <div className="w-full lg:mt-5">
      <MessagePlayerButton otherUserId={playerId} layout="profile" />
    </div>
  );
}
