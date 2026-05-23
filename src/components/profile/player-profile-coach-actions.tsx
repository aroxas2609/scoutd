"use client";

import { MessagePlayerButton } from "@/components/messaging/message-player-button";
import { SavePlayerButton } from "@/components/discovery/save-player-button";
import { TrialInviteDialog } from "@/components/trials/trial-invite-dialog";

export function PlayerProfileCoachActions({ playerId }: { playerId: string }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      <MessagePlayerButton playerId={playerId} layout="profile" />
      <SavePlayerButton playerId={playerId} layout="profile" />
      <TrialInviteDialog playerId={playerId} layout="profile" />
    </div>
  );
}
