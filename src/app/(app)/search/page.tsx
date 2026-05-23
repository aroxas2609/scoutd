"use client";

import Link from "next/link";
import { CoachSearchView } from "@/components/discovery/coach-search-view";
import { PlayerSearchView } from "@/components/discovery/player-search-view";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { PremiumButton } from "@/components/ui/premium-button";
import { PageLoader } from "@/components/ui/page-loader";

export default function SearchPage() {
  const { isCoach, isPlayer, role, isLoading } = useIsCoachViewer();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!role) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted-foreground">Choose your account type to continue.</p>
        <Link href="/role" className="mt-4 inline-block">
          <PremiumButton>Select role</PremiumButton>
        </Link>
      </div>
    );
  }

  if (isCoach) {
    return <PlayerSearchView />;
  }

  if (isPlayer) {
    return <CoachSearchView />;
  }

  return <PlayerSearchView />;
}
