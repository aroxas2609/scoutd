"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { PremiumButton } from "@/components/ui/premium-button";
import { PageLoader } from "@/components/ui/page-loader";

const PlayerSearchView = dynamic(
  () =>
    import("@/components/discovery/player-search-view").then((m) => m.PlayerSearchView),
  { loading: () => <PageLoader /> }
);

const CoachSearchView = dynamic(
  () =>
    import("@/components/discovery/coach-search-view").then((m) => m.CoachSearchView),
  { loading: () => <PageLoader /> }
);

export default function SearchPage() {
  const { isCoach, isPlayer, role, userId, isLoading, isError } = useIsCoachViewer();

  if (isLoading) {
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
    return <CoachSearchView key={`explore-${userId}`} />;
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
