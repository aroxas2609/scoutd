"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { resolveAuthSession } from "@/lib/auth/resolve-auth-session";
import { profileActionClass } from "@/components/profile/player-profile-action-styles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PlayerProfile } from "@/types/database";

type SavePlayerButtonProps = {
  playerId: string;
  layout?: "default" | "profile";
};

export function SavePlayerButton({
  playerId,
  layout = "default",
}: SavePlayerButtonProps) {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      const session = await resolveAuthSession(qc);
      if (!session) {
        setLoading(false);
        return;
      }

      const shortlist = qc.getQueryData<PlayerProfile[]>(["shortlist"]);
      if (shortlist) {
        setSaved(shortlist.some((p) => p.user_id === playerId));
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("saved_players")
        .select("player_id")
        .eq("coach_id", session.userId)
        .eq("player_id", playerId)
        .maybeSingle();
      setSaved(!!data);
      setLoading(false);
    }
    void check();
  }, [playerId, qc]);

  async function toggle() {
    const session = await resolveAuthSession(qc);
    if (!session) return;

    const supabase = createClient();
    setBusy(true);
    if (saved) {
      const { error } = await supabase
        .from("saved_players")
        .delete()
        .eq("coach_id", session.userId)
        .eq("player_id", playerId);
      if (error) toast.error("Could not remove from shortlist");
      else {
        setSaved(false);
        toast.success("Removed from shortlist");
        void qc.invalidateQueries({ queryKey: ["shortlist"] });
      }
    } else {
      const { error } = await supabase.from("saved_players").upsert({
        coach_id: session.userId,
        player_id: playerId,
      });
      if (error) toast.error("Could not save player");
      else {
        setSaved(true);
        toast.success("Saved to shortlist");
        void qc.invalidateQueries({ queryKey: ["shortlist"] });
      }
    }
    setBusy(false);
  }

  const isProfile = layout === "profile";

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={loading || busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      className={cn(
        isProfile
          ? profileActionClass(saved ? "saved" : "secondary")
          : cn(
              "flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 text-sm font-medium transition-colors active:scale-[0.99] disabled:opacity-50",
              saved
                ? "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]"
                : "border-white/[0.1] bg-[var(--bg-surface)] hover:bg-white/[0.06]"
            )
      )}
    >
      <Bookmark
        className={cn(
          isProfile ? "h-[18px] w-[18px]" : "h-4 w-4 shrink-0",
          saved && "fill-current"
        )}
      />
      <span className={isProfile ? "" : "truncate"}>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
