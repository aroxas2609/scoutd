"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PlayerCard } from "@/components/discovery/player-card";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/types/database";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ShortlistPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: saved } = await supabase
        .from("saved_players")
        .select("player_id")
        .eq("coach_id", user.id);
      if (!saved?.length) return;
      const ids = saved.map((s) => s.player_id);
      const { data } = await supabase
        .from("player_profiles")
        .select("*, profiles!inner(*)")
        .in("user_id", ids);
      setPlayers((data ?? []) as PlayerProfile[]);
    }
    load();
  }, []);

  return (
    <div>
      <AppHeader title="Shortlist" subtitle="Saved players" />
      <div className="grid gap-4 px-4 pb-8 sm:grid-cols-2">
        {players.length === 0 ? (
          <div className="col-span-full">
            <EmptyStateCinematic
              icon={<Bookmark className="h-8 w-8 text-[var(--accent-electric)]" />}
              title="No saved players"
              description="Heart players in Discover swipe mode to add them here."
              action={
                <Link
                  href="/discover"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Go to Discover
                </Link>
              }
            />
          </div>
        ) : (
          players.map((p) => <PlayerCard key={p.user_id} player={p} saved />)
        )}
      </div>
    </div>
  );
}
