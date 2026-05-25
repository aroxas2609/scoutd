"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

/** Discover shell while viewer role resolves — avoids full-screen PageLoader. */
export function DiscoverPageSkeleton() {
  return (
    <div>
      <AppHeader title="Discover" subtitle="Browse players or search below" />
      <div className="sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md lg:top-[4.5rem] lg:px-6 lg:py-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
      <div className="space-y-10 px-4 pb-8 pt-4 lg:px-6">
        <div>
          <Skeleton className="h-3 w-20" />
          <div className="mt-3 flex gap-3.5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-[11.5rem] shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-16" />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Skeleton className="aspect-[4/5] rounded-2xl" />
            <Skeleton className="aspect-[4/5] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
