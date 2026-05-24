import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import { getCoachById } from "@/features/coaches/repository";
import { getPlayerById } from "@/features/players/repository";
import { fetchShortlistPlayersForUser } from "@/features/shortlist/hooks";
import { fetchConversationsForUser } from "@/features/messaging/hooks";
import { fetchTrialsForViewer } from "@/features/trials/hooks";

const PREFETCH_TABS_ENABLED =
  process.env.NEXT_PUBLIC_PREFETCH_TABS !== "false";

export type PrefetchTabsContext = {
  userId: string;
  role: UserRole | null;
};

function prefetchShortlist(qc: QueryClient, userId: string) {
  const supabase = createClient();
  return qc.prefetchQuery({
    queryKey: ["shortlist"],
    queryFn: () => fetchShortlistPlayersForUser(supabase, userId),
  });
}

function prefetchConversations(qc: QueryClient, userId: string) {
  const supabase = createClient();
  return qc.prefetchQuery({
    queryKey: ["conversations", "active"],
    queryFn: () => fetchConversationsForUser(supabase, userId, "active"),
  });
}

function prefetchTrials(qc: QueryClient, ctx: PrefetchTabsContext) {
  const supabase = createClient();
  const viewerRole =
    ctx.role === "coach" || ctx.role === "player" ? ctx.role : null;
  return qc.prefetchQuery({
    queryKey: ["trials", "active"],
    queryFn: () =>
      fetchTrialsForViewer(supabase, ctx.userId, viewerRole, "active"),
  });
}

function prefetchProfile(qc: QueryClient, ctx: PrefetchTabsContext) {
  const supabase = createClient();
  if (ctx.role === "coach") {
    return qc.prefetchQuery({
      queryKey: ["coach", ctx.userId],
      queryFn: () => getCoachById(supabase, ctx.userId),
    });
  }
  if (ctx.role === "player") {
    return qc.prefetchQuery({
      queryKey: ["player", ctx.userId],
      queryFn: () => getPlayerById(supabase, ctx.userId),
    });
  }
  return Promise.resolve();
}

/** Warm list endpoints for inactive tabs (not full Discover search). */
export function prefetchAppTabs(qc: QueryClient, ctx: PrefetchTabsContext) {
  if (!PREFETCH_TABS_ENABLED || !ctx.userId) return;

  const tasks: Promise<unknown>[] = [
    prefetchConversations(qc, ctx.userId),
    prefetchTrials(qc, ctx),
    prefetchProfile(qc, ctx),
  ];

  if (ctx.role === "coach") {
    tasks.push(prefetchShortlist(qc, ctx.userId));
  }

  void Promise.allSettled(tasks);
}

/** Prefetch a single tab route on hover / touch intent. */
export function prefetchAppTabRoute(
  qc: QueryClient,
  href: string,
  ctx: PrefetchTabsContext
) {
  if (!PREFETCH_TABS_ENABLED || !ctx.userId) return;

  switch (href) {
    case "/shortlist":
      if (ctx.role === "coach") void prefetchShortlist(qc, ctx.userId);
      break;
    case "/messages":
      void prefetchConversations(qc, ctx.userId);
      break;
    case "/trials":
      void prefetchTrials(qc, ctx);
      break;
    case "/profile":
      void prefetchProfile(qc, ctx);
      break;
    default:
      break;
  }
}
