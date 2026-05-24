"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Calendar, MapPin, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import {
  useTrial,
  useUpdateTrialStatus,
  useArchiveTrialInvite,
  useDeleteTrialInvite,
} from "@/features/trials/hooks";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message } from "@/types/database";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TrialInviteCard({ message }: { message: Message }) {
  const meta = message.metadata as {
    trial_id?: string;
    scheduled_at?: string;
    location?: string;
    notes?: string;
  };

  const trialId = meta.trial_id;
  const { data: trial, isLoading } = useTrial(trialId);
  const { isPlayer } = useIsCoachViewer();
  const updateStatus = useUpdateTrialStatus();
  const archiveTrial = useArchiveTrialInvite();
  const deleteTrial = useDeleteTrialInvite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = trial?.status ?? "pending";
  const isPending = status === "pending";
  const scheduledAt = trial?.scheduled_at ?? meta.scheduled_at;
  const location = trial?.location ?? meta.location;
  const notes = trial?.notes ?? meta.notes;

  async function respond(next: "accepted" | "declined" | "maybe") {
    if (!trialId) return;
    try {
      await updateStatus.mutateAsync({ trialId, status: next });
      toast.success(
        next === "accepted"
          ? "Trial accepted"
          : next === "declined"
            ? "Trial declined"
            : "Marked as maybe"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update trial");
    }
  }

  async function handleArchive() {
    if (!trialId) return;
    setMenuOpen(false);
    try {
      await archiveTrial.mutateAsync({ trialId, archived: true });
      toast.success("Trial archived — see Trials tab");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not archive");
    }
  }

  async function handleDelete() {
    if (!trialId) return;
    try {
      await deleteTrial.mutateAsync(trialId);
      setConfirmDelete(false);
      toast.success("Trial invite deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <GlassCard className="mx-auto max-w-sm border-white/[0.08] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trial invitation
          </p>
          {!isLoading ? (
            <span
              className={cn(
                "rounded-lg px-2 py-0.5 text-xs capitalize",
                status === "accepted" && "bg-[var(--success)]/15 text-[#a7f3d0]",
                status === "declined" && "bg-[var(--destructive)]/15 text-[#ffb3c1]",
                status === "maybe" && "bg-amber-500/10 text-amber-200",
                status === "pending" && "bg-white/[0.06] text-muted-foreground"
              )}
            >
              {status}
            </span>
          ) : null}
        </div>
        {trialId ? (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {confirmDelete ? (
              <div className="w-40 rounded-xl border border-red-500/30 bg-red-500/10 p-2">
                <p className="text-[10px] text-red-200">Delete invite?</p>
                <div className="mt-1.5 flex gap-1">
                  <button
                    type="button"
                    disabled={deleteTrial.isPending}
                    onClick={() => void handleDelete()}
                    className="flex-1 rounded-md bg-red-500 px-2 py-1 text-[10px] font-semibold text-white"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-md border border-white/20 px-2 py-1 text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06]"
                aria-label="Trial options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-white/10 bg-[var(--bg-elevated)]">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    void handleArchive();
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
      <p className="mt-2 font-medium">{message.body}</p>
      {scheduledAt && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(scheduledAt).toLocaleString()}
        </p>
      )}
      {location && (
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {location}
        </p>
      )}
      {notes && <p className="mt-2 text-sm text-muted-foreground">{notes}</p>}
      {trialId && isPlayer && isPending && (
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton
            type="button"
            size="sm"
            disabled={updateStatus.isPending}
            onClick={() => void respond("accepted")}
          >
            Accept
          </PremiumButton>
          <PremiumButton
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20"
            disabled={updateStatus.isPending}
            onClick={() => void respond("declined")}
          >
            Decline
          </PremiumButton>
          <PremiumButton
            type="button"
            size="sm"
            variant="ghost"
            disabled={updateStatus.isPending}
            onClick={() => void respond("maybe")}
          >
            Maybe
          </PremiumButton>
        </div>
      )}
      {trialId && !isPending && !isLoading && (
        <p className="mt-3 text-xs text-muted-foreground">
          You responded to this invite. Check the Trials tab for details.
        </p>
      )}
    </GlassCard>
  );
}
