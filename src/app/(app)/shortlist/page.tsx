"use client";

import { AppHeader } from "@/components/layout/app-header";
import { PlayerCard } from "@/components/discovery/player-card";
import { useShortlistPlayers } from "@/features/shortlist/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { cn } from "@/lib/utils";

export default function ShortlistPage() {
  const { data: players = [], isLoading } = useShortlistPlayers();

  return (
    <div>
      <AppHeader title="Shortlist" subtitle="Saved players" />
      <div className="grid gap-4 px-4 pb-10 pt-1 sm:grid-cols-2 lg:gap-4 lg:px-4 lg:pb-8 lg:pt-0 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full">
            <PageLoader />
          </div>
        ) : players.length === 0 ? (
          <div className="col-span-full">
            <EmptyStateCinematic
              icon={<Bookmark className="h-8 w-8 text-[var(--accent-electric)]" />}
              title="No saved players"
              description="Heart players in swipe mode to add them here."
              action={
                <Link
                  href="/search"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Discover players
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
