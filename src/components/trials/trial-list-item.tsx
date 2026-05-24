"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ArchiveRestore, Calendar, MapPin, MoreHorizontal, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { PremiumButton } from "@/components/ui/premium-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useArchiveTrialInvite,
  useDeleteTrialInvite,
  useUpdateTrialStatus,
  type TrialInboxFilter,
} from "@/features/trials/hooks";
import type { TrialInviteListItem } from "@/features/trials/hooks";
import type { TrialStatus } from "@/types/database";
import { profilePathFor } from "@/features/messaging/types";
import { cn } from "@/lib/utils";

type Props = {
  trial: TrialInviteListItem;
  inboxFilter: TrialInboxFilter;
  isPlayerViewer: boolean;
};

export function TrialListItem({ trial, inboxFilter, isPlayerViewer }: Props) {
  const pathname = usePathname();
  const updateStatus = useUpdateTrialStatus();
  const archiveTrial = useArchiveTrialInvite();
  const deleteTrial = useDeleteTrialInvite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function respond(status: TrialStatus) {
    try {
      await updateStatus.mutateAsync({ trialId: trial.id, status });
      toast.success(
        status === "accepted"
          ? "Trial accepted"
          : status === "declined"
            ? "Trial declined"
            : "Trial updated"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update trial");
    }
  }

  async function handleArchiveToggle() {
    setMenuOpen(false);
    const archived = inboxFilter === "active";
    try {
      await archiveTrial.mutateAsync({ trialId: trial.id, archived });
      toast.success(archived ? "Trial archived" : "Trial restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update trial");
    }
  }

  async function handleDelete() {
    try {
      await deleteTrial.mutateAsync(trial.id);
      setConfirmDelete(false);
      toast.success("Trial invite deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete trial");
    }
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-lg px-2 py-0.5 text-xs font-medium capitalize",
            trial.status === "accepted" && "bg-emerald-500/10 text-emerald-300",
            trial.status === "declined" && "bg-red-500/10 text-red-300",
            trial.status === "maybe" && "bg-amber-500/10 text-amber-200",
            trial.status === "pending" && "bg-white/[0.06] text-muted-foreground"
          )}
        >
          {trial.status}
        </span>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {confirmDelete ? (
            <div className="w-44 rounded-xl border border-red-500/30 bg-red-500/10 p-2">
              <p className="text-xs text-red-200">Delete this invite permanently?</p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  disabled={deleteTrial.isPending}
                  onClick={() => void handleDelete()}
                  className="flex-1 rounded-md bg-red-500 px-2 py-1.5 text-[10px] font-semibold text-white"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-md border border-white/20 px-2 py-1.5 text-[10px] text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Trial options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-[var(--bg-elevated)]">
              {inboxFilter === "active" ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    void handleArchiveToggle();
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    void handleArchiveToggle();
                  }}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Move to inbox
                </DropdownMenuItem>
              )}
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
      </div>

      <Link
        href={profilePathFor(trial.counterpartyRole, trial.counterpartyId, pathname)}
        className="mt-3 flex items-center gap-2 rounded-lg transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[var(--bg-elevated)]">
          <User className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold leading-tight">{trial.displayName}</span>
          {trial.displaySubtitle ? (
            <span className="block truncate text-xs text-muted-foreground">
              {trial.displaySubtitle}
            </span>
          ) : (
            <span className="block text-xs text-muted-foreground">
              {isPlayerViewer ? "View club" : "View player"}
            </span>
          )}
        </span>
      </Link>

      <p className="mt-3 flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 shrink-0 text-[var(--accent-brand)]" />
        {new Date(trial.scheduled_at).toLocaleString()}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        {trial.location}
      </p>
      {trial.notes ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{trial.notes}</p>
      ) : null}

      {isPlayerViewer && trial.status === "pending" && inboxFilter === "active" ? (
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
            className="border-white/20 bg-transparent text-foreground"
            disabled={updateStatus.isPending}
            onClick={() => void respond("declined")}
          >
            Decline
          </PremiumButton>
        </div>
      ) : null}
    </li>
  );
}
