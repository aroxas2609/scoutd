"use client";

import { CoachCard } from "@/components/discovery/coach-card";
import {
  useAllCoaches,
  useFeaturedCoaches,
  useRecruitingCoaches,
} from "@/features/coaches/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import { Building2 } from "lucide-react";

export function CoachDiscoverSections() {
  const featured = useFeaturedCoaches();
  const recruiting = useRecruitingCoaches();
  const all = useAllCoaches(12);

  const featuredList = featured.data?.data ?? [];
  const recruitingList = recruiting.data?.data ?? [];
  const allList = all.data?.data ?? [];
  const hasAny = featuredList.length || recruitingList.length || allList.length;
  const loading = featured.isPending || recruiting.isPending || all.isPending;

  if (loading) return <PageLoader />;

  if (!hasAny) {
    return (
      <EmptyStateCinematic
        icon={<Building2 className="h-6 w-6" />}
        title="No clubs yet"
        description="When coaches join Scoutd, their clubs will show up here."
      />
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      {featuredList.length > 0 ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Featured
          </h2>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 hide-scrollbar lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
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
          <div className="mt-3 flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
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
          <div className="mt-3 flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {allList.map((c) => (
              <CoachCard key={c.user_id} coach={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
