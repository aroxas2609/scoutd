"use client";

import Link from "next/link";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { PlayerSearchView } from "@/components/discovery/player-search-view";
import { PlayerExploreTabs } from "@/components/discovery/player-explore-tabs";
import { PremiumButton } from "@/components/ui/premium-button";
import { PageLoader } from "@/components/ui/page-loader";

export default function SearchPage() {
  const { isCoach, isPlayer, role, userId, isLoading, isError } = useIsCoachViewer();

  if (isLoading && !role) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Could not load your account. Try refreshing the page.
        </p>
      </div>
    );
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
    return <PlayerSearchView key={`discover-${userId}`} />;
  }

  if (isPlayer) {
    return <PlayerExploreTabs key={`explore-${userId}`} />;
  }

  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">Choose your account type to continue.</p>
      <Link href="/role" className="mt-4 inline-block">
        <PremiumButton>Select role</PremiumButton>
      </Link>
    </div>
  );
}
