"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCoach } from "@/features/coaches/hooks";
import { useViewerRole } from "@/features/auth/use-viewer-role";
import { CoachProfileView } from "@/components/profile/coach-profile-view";
import { Skeleton } from "@/components/ui/skeleton";

function CoachProfileSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-24 pt-6">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-[88px] w-[88px] rounded-full" />
        <div className="flex-1 space-y-2 pt-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

export default function CoachProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useCoach(id);
  const { data: viewer } = useViewerRole();
  const coach = data?.data ?? null;
  const [isOwn, setIsOwn] = useState(false);
  const isPlayerViewer = viewer?.role === "player";

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsOwn(user?.id === id);
    });
  }, [id]);

  if (isLoading && !coach) return <CoachProfileSkeleton />;

  if (!coach) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">Club profile not found</p>
    );
  }

  return (
    <CoachProfileView coach={coach} isOwn={isOwn} isPlayerViewer={isPlayerViewer} />
  );
}
