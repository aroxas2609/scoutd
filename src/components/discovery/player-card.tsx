"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Play, User } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { VerificationBadge } from "@/components/ui/verification-badge";
import type { PlayerProfile, AvailabilityStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: PlayerProfile;
  onSave?: () => void;
  saved?: boolean;
  compact?: boolean;
}

export function PlayerCard({ player, onSave, saved, compact }: PlayerCardProps) {
  const name = player.profiles?.full_name ?? "Player";
  const avatar = player.profiles?.avatar_url;
  const availability = (player.availability ?? "available") as AvailabilityStatus;

  return (
    <Link href={`/profile/player/${player.user_id}`} className="block">
      <GlassCard
        className={cn(
          "overflow-hidden transition-colors hover:border-white/[0.14]",
          compact ? "w-56 shrink-0" : "w-full"
        )}
      >
        <div className="relative aspect-[4/5] bg-[var(--bg-elevated)]">
          {avatar ? (
            <Image src={avatar} alt={name} fill className="object-cover" sizes="(max-width: 512px) 100vw, 512px" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User className="h-12 w-12 text-white/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent" />
          {player.has_highlights ? (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
              <Play className="h-3 w-3 fill-current" />
              Highlights
            </span>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">{name}</h3>
                  {player.verified_at ? <VerificationBadge /> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {player.age ? `${player.age} · ` : ""}
                  {player.position ?? "—"}
                  {player.current_club ? ` · ${player.current_club}` : ""}
                </p>
                {player.location_public ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {player.location_public}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <AvailabilityBadge status={availability} />
              {onSave ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSave();
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                    saved
                      ? "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]"
                      : "border-white/[0.1] bg-white/[0.05] text-muted-foreground"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
