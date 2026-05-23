"use client";

import { AppHeader } from "@/components/layout/app-header";
import { CoachCard } from "@/components/discovery/coach-card";
import {
  useAllCoaches,
  useFeaturedCoaches,
  useRecruitingCoaches,
} from "@/features/coaches/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import { Building2 } from "lucide-react";

export function CoachDiscoverView() {
  const featured = useFeaturedCoaches();
  const recruiting = useRecruitingCoaches();
  const all = useAllCoaches(12);

  const featuredList = featured.data?.data ?? [];
  const recruitingList = recruiting.data?.data ?? [];
  const allList = all.data?.data ?? [];
  const hasAny = featuredList.length || recruitingList.length || allList.length;
  const loading = featured.isPending || recruiting.isPending || all.isPending;

  return (
    <>
      <AppHeader title="Discover" subtitle="Clubs recruiting players" />
      <div className="px-4 pb-8">
        {loading ? (
          <PageLoader />
        ) : !hasAny ? (
          <EmptyStateCinematic
            icon={<Building2 className="h-6 w-6" />}
            title="No clubs yet"
            description="When coaches join Scoutd, their clubs will show up here."
          />
        ) : (
          <div className="space-y-8 pt-2">
            {featuredList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Featured
                </h2>
                <div className="mt-3 flex gap-3 overflow-x-auto hide-scrollbar">
                  {featuredList.map((c) => (
                    <CoachCard key={c.user_id} coach={c} compact />
                  ))}
                </div>
              </section>
            ) : null}
            {recruitingList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recruiting now
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {recruitingList.map((c) => (
                    <CoachCard key={c.user_id} coach={c} />
                  ))}
                </div>
              </section>
            ) : null}
            {allList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  All clubs
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {allList.map((c) => (
                    <CoachCard key={c.user_id} coach={c} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
