"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PlayerSearchView } from "@/components/discovery/player-search-view";
import { CoachSearchView } from "@/components/discovery/coach-search-view";

const exploreTabs = ["players", "clubs"] as const;
type ExploreTab = (typeof exploreTabs)[number];

export function PlayerExploreTabs() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(exploreTabs).withDefault("players")
  );

  const activeTab: ExploreTab = tab ?? "players";

  return (
    <div>
      <AppHeader title="Explore" subtitle="Players & clubs" />
      <div className="border-b border-white/[0.06] px-4 py-3 lg:px-6">
        <SegmentedControl
          value={activeTab}
          onChange={setTab}
          segments={[
            { value: "players", label: "Players" },
            { value: "clubs", label: "Clubs" },
          ]}
        />
      </div>
      {activeTab === "players" ? (
        <PlayerSearchView viewerMode="player" hideHeader />
      ) : (
        <CoachSearchView hideHeader />
      )}
    </div>
  );
}
