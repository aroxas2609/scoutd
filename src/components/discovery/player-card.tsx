"use client";

import { useEffect, useState } from "react";
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
  distanceKm?: number;
  onSave?: () => void;
  saved?: boolean;
  compact?: boolean;
}

export function PlayerCard({ player, distanceKm, onSave, saved, compact }: PlayerCardProps) {
  const name = player.profiles?.full_name ?? "Player";
  const avatar = player.profiles?.avatar_url;
  const [avatarError, setAvatarError] = useState(false);
  const availability = (player.availability ?? "available") as AvailabilityStatus;

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);
  const districtName = player.associations?.name ?? null;
  const suburbPostcode = [player.suburb, player.postcode].filter(Boolean).join(" · ");

  return (
    <Link href={`/profile/player/${player.user_id}`} className="block">
      <GlassCard
        className={cn(
          "overflow-hidden transition-colors hover:border-white/[0.14]",
          compact ? "w-[11.5rem] shrink-0 lg:w-full lg:shrink" : "w-full"
        )}
      >
        <div className="relative aspect-[4/5] bg-[var(--bg-elevated)]">
          {avatar && !avatarError ? (
            <Image
              key={avatar}
              src={avatar}
              alt={name}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User className="h-12 w-12 text-white/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/20 to-transparent" />
          {distanceKm != null || player.has_highlights ? (
            <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
              {distanceKm != null ? (
                <span className="max-w-[55%] shrink-0 truncate rounded-lg border border-white/[0.08] bg-black/60 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                  {compact ? `${distanceKm} km` : `${distanceKm} km away`}
                </span>
              ) : (
                <span className="shrink-0" aria-hidden />
              )}
              {player.has_highlights ? (
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-black/60 text-xs text-foreground backdrop-blur-sm",
                    compact ? "px-1.5 py-1" : "px-2 py-1"
                  )}
                  title="Has highlights"
                >
                  <Play className="h-3 w-3 fill-current" />
                  {!compact ? <span>Highlights</span> : null}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/90 to-transparent p-4 pt-10">
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
                {suburbPostcode ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {suburbPostcode}
                  </p>
                ) : player.location_public ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {player.location_public}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {districtName ? (
                    <span className="inline-block max-w-full truncate rounded-md border border-white/[0.08] bg-[var(--bg-deep)]/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {districtName}
                    </span>
                  ) : null}
                  {player.willing_to_travel ? (
                    <span className="inline-block rounded-md border border-[var(--accent-brand)]/25 bg-[var(--accent-brand)]/10 px-2 py-0.5 text-[10px] font-medium text-foreground/90">
                      Willing to travel
                    </span>
                  ) : null}
                </div>
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
