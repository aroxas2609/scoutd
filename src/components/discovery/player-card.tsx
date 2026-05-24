"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { profileUrl } from "@/lib/navigation/profile-return-path";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { prefetchPlayerProfile } from "@/features/players/prefetch-player-profile";
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

function PlayerCardInner({ player, distanceKm, onSave, saved, compact }: PlayerCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const profileHref = profileUrl(`/profile/player/${player.user_id}`, pathname);

  function warmProfile() {
    router.prefetch(profileHref);
    prefetchPlayerProfile(qc, player.user_id);
  }

  const name = player.profiles?.full_name ?? "Player";
  const avatar = player.profiles?.avatar_url;
  const [avatarError, setAvatarError] = useState(false);
  const availability = (player.availability ?? "available") as AvailabilityStatus;

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  const districtName = player.associations?.name ?? null;
  const suburbPostcode = [player.suburb, player.postcode].filter(Boolean).join(" · ");
  const metaMobile = [
    player.age != null ? `${player.age} yrs` : null,
    player.position ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
  const showTopRow =
    distanceKm != null || player.has_highlights || availability != null;

  return (
    <Link
      href={profileHref}
      prefetch
      onTouchStart={warmProfile}
      onMouseEnter={warmProfile}
      className="block"
    >
      <GlassCard
        className={cn(
          "overflow-hidden border-white/[0.06] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.04] transition-colors",
          "hover:border-white/[0.14] lg:border-white/[0.08] lg:shadow-none lg:ring-0",
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
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 256px"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] from-[6%] via-[var(--bg-deep)]/75 via-[48%] to-black/15 lg:from-[var(--bg-deep)] lg:via-[var(--bg-deep)]/20 lg:to-transparent" />

          {showTopRow ? (
            <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
              {distanceKm != null ? (
                <span
                  className={cn(
                    "max-w-[58%] shrink-0 truncate rounded-full border border-white/[0.06] bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md",
                    "lg:max-w-[55%] lg:rounded-lg lg:border-white/[0.08] lg:bg-black/60 lg:px-2 lg:py-1 lg:text-xs lg:text-foreground lg:backdrop-blur-sm",
                    compact && "lg:px-2"
                  )}
                >
                  {compact ? `${distanceKm} km` : `${distanceKm} km away`}
                </span>
              ) : (
                <span className="shrink-0" aria-hidden />
              )}

              <div className="flex shrink-0 items-center gap-1.5">
                {player.has_highlights ? (
                  <span
                    className={cn(
                      "hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-black/60 text-xs text-foreground backdrop-blur-sm lg:flex",
                      compact ? "px-1.5 py-1" : "px-2 py-1"
                    )}
                    title="Has highlights"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    {!compact ? <span>Highlights</span> : null}
                  </span>
                ) : null}
                <AvailabilityBadge status={availability} className="lg:hidden" />
              </div>
            </div>
          ) : null}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/95 via-25% to-transparent p-3.5 pt-12 lg:via-[var(--bg-deep)]/90 lg:p-4 lg:pt-10">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] lg:text-base lg:font-semibold lg:text-foreground lg:drop-shadow-none">
                    {name}
                  </h3>
                  {player.verified_at ? (
                    <VerificationBadge className="shrink-0 opacity-90 lg:opacity-100" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-[13px] font-medium text-white/55 lg:mt-0 lg:text-sm lg:font-normal lg:text-muted-foreground">
                  <span className="lg:hidden">{metaMobile || "—"}</span>
                  <span className="hidden lg:inline">
                    {player.age ? `${player.age} · ` : ""}
                    {player.position ?? "—"}
                    {player.current_club ? ` · ${player.current_club}` : ""}
                  </span>
                </p>

                {suburbPostcode ? (
                  <p className="mt-1 hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {suburbPostcode}
                  </p>
                ) : player.location_public ? (
                  <p className="mt-1 hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {player.location_public}
                  </p>
                ) : null}

                <div className="mt-2 hidden flex-wrap gap-1.5 lg:flex">
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

            <div className="mt-2.5 flex items-center justify-between gap-2 lg:mt-3">
              <AvailabilityBadge status={availability} className="hidden lg:inline-flex" />
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
                      ? "border-[var(--accent-brand)]/35 bg-[var(--accent-brand)]/10 text-[var(--accent-brand)] lg:border-[var(--accent-brand)]/40"
                      : "border-white/[0.08] bg-white/[0.04] text-white/50 lg:border-white/[0.1] lg:bg-white/[0.05] lg:text-muted-foreground"
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

export const PlayerCard = memo(PlayerCardInner);
