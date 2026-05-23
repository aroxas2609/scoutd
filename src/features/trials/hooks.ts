"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  deleteTrialInvite,
  setTrialInviteArchived,
  updateTrialStatus,
} from "@/features/trials/actions";
import {
  fetchParticipantsByUserIds,
  participantDisplayName,
} from "@/features/messaging/participant-display";
import { messageListSubtitle } from "@/features/profile/coach-display";
import type { TrialInvite, TrialStatus, UserRole } from "@/types/database";

export type TrialInboxFilter = "active" | "archived";

export type TrialInviteListItem = TrialInvite & {
  displayName: string;
  displaySubtitle: string | null;
  counterpartyId: string;
  counterpartyRole: Extract<UserRole, "coach" | "player">;
};

async function enrichTrialInvites(
  supabase: ReturnType<typeof createClient>,
  trials: TrialInvite[],
  viewerRole: "coach" | "player" | null
): Promise<TrialInviteListItem[]> {
  if (!trials.length) return [];

  if (viewerRole === "coach") {
    const playerIds = [...new Set(trials.map((t) => t.player_id))];
    const { data: players } = await supabase
      .from("player_profiles")
      .select("user_id, position, current_club, profiles(full_name)")
      .in("user_id", playerIds);

    const byPlayerId = new Map(
      (players ?? []).map((p) => {
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        return [p.user_id, { ...p, profileName: profile?.full_name ?? null }] as const;
      })
    );

    return trials.map((trial) => {
      const player = byPlayerId.get(trial.player_id);
      const name = player?.profileName?.trim() || "Player";
      const subtitle = [player?.position, player?.current_club].filter(Boolean).join(" · ") || null;
      return {
        ...trial,
        displayName: name,
        displaySubtitle: subtitle,
        counterpartyId: trial.player_id,
        counterpartyRole: "player" as const,
      };
    });
  }

  const coachIds = [...new Set(trials.map((t) => t.coach_id))];
  const coachesById = await fetchParticipantsByUserIds(supabase, coachIds);

  return trials.map((trial) => {
    const coach = coachesById.get(trial.coach_id);
    const subtitle = coach
      ? messageListSubtitle(coach) ?? coach.club_name?.trim() ?? null
      : null;
    return {
      ...trial,
      displayName: participantDisplayName(coach),
      displaySubtitle: subtitle,
      counterpartyId: trial.coach_id,
      counterpartyRole: "coach" as const,
    };
  });
}

let trialsRealtimeRefCount = 0;
let trialsRealtimeChannel: RealtimeChannel | null = null;

/** Call once on the trials page (avoids duplicate channel subscriptions). */
export function useTrialsRealtime() {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    trialsRealtimeRefCount += 1;

    if (!trialsRealtimeChannel) {
      trialsRealtimeChannel = supabase
        .channel("trial-invites")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trial_invites" },
          () => {
            qc.invalidateQueries({ queryKey: ["trials"] });
            qc.invalidateQueries({ queryKey: ["trial"] });
          }
        )
        .subscribe();
    }

    return () => {
      trialsRealtimeRefCount -= 1;
      if (trialsRealtimeRefCount <= 0 && trialsRealtimeChannel) {
        void supabase.removeChannel(trialsRealtimeChannel);
        trialsRealtimeChannel = null;
        trialsRealtimeRefCount = 0;
      }
    };
  }, [supabase, qc]);
}

function applyTrialArchiveFilter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  userId: string,
  role: "coach" | "player" | null,
  inboxFilter: TrialInboxFilter
) {
  const column = role === "coach" ? "coach_archived_at" : "player_archived_at";

  if (role === "coach") {
    query = query.eq("coach_id", userId);
  } else if (role === "player") {
    query = query.eq("player_id", userId);
  } else {
    query = query.or(`player_id.eq.${userId},coach_id.eq.${userId}`);
  }

  if (inboxFilter === "archived") {
    return query.not(column, "is", null);
  }
  return query.is(column, null);
}

export function useTrials(inboxFilter: TrialInboxFilter = "active") {
  const supabase = createClient();

  return useQuery({
    queryKey: ["trials", inboxFilter],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = (profile?.role as "coach" | "player" | null) ?? null;

      let q = supabase.from("trial_invites").select("*").order("scheduled_at", { ascending: true });

      q = applyTrialArchiveFilter(q, user.id, role, inboxFilter);

      const { data, error } = await q;
      if (error) throw error;
      const trials = (data ?? []) as TrialInvite[];
      return enrichTrialInvites(supabase, trials, role);
    },
  });
}

export function useTrial(trialId: string | undefined) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["trial", trialId],
    queryFn: async () => {
      if (!trialId) return null;
      const { data, error } = await supabase
        .from("trial_invites")
        .select("*")
        .eq("id", trialId)
        .single();
      if (error) throw error;
      return data as TrialInvite;
    },
    enabled: !!trialId,
  });
}

export function useUpdateTrialStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      trialId,
      status,
    }: {
      trialId: string;
      status: TrialStatus;
    }) => {
      const result = await updateTrialStatus(trialId, status);
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_data, { trialId }) => {
      qc.invalidateQueries({ queryKey: ["trials"] });
      qc.invalidateQueries({ queryKey: ["trial", trialId] });
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useArchiveTrialInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      trialId,
      archived,
    }: {
      trialId: string;
      archived: boolean;
    }) => {
      const result = await setTrialInviteArchived(trialId, archived);
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trials"] });
      qc.invalidateQueries({ queryKey: ["trial"] });
    },
  });
}

export function useDeleteTrialInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trialId: string) => {
      const result = await deleteTrialInvite(trialId);
      if (result?.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trials"] });
      qc.invalidateQueries({ queryKey: ["trial"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
