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
import type { TrialInvite, TrialStatus } from "@/types/database";

export type TrialInboxFilter = "active" | "archived";

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
      return (data ?? []) as TrialInvite[];
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
