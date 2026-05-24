"use client";

import { use, useEffect } from "react";
import { usePlayer } from "@/features/players/hooks";
import { useViewerRole } from "@/features/auth/use-viewer-role";
import { PlayerProfileView } from "@/components/profile/player-profile-view";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

function PlayerProfileSkeleton() {
  return (
    <div className="pb-24">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="space-y-4 px-4 pt-6">
        <div className="flex gap-4">
          <Skeleton className="h-[88px] w-[88px] rounded-2xl" />
          <div className="flex-1 space-y-2 pt-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePlayer(id);
  const { data: viewer } = useViewerRole();
  const player = data?.data ?? null;
  const isOwn = viewer?.userId === id;

  useEffect(() => {
    async function trackView() {
      const viewerId = viewer?.userId;
      if (!viewerId || viewerId === id) return;
      const supabase = createClient();
      await supabase.from("profile_views").insert({ viewer_id: viewerId, viewed_id: id });
      await supabase.from("notifications").insert({
        user_id: id,
        type: "profile_viewed",
        title: "Profile viewed",
        body: "A coach viewed your profile",
        metadata: { viewer_id: viewerId },
      });
    }
    if (viewer?.userId) {
      trackView();
    }
  }, [id, viewer?.userId]);

  if (isLoading && !player) return <PlayerProfileSkeleton />;
  if (!player) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">Player not found</p>
    );
  }

  return (
    <PlayerProfileView player={player} isOwn={isOwn} viewerRole={viewer?.role ?? null} />
  );
}
