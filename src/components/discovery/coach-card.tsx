"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { coachProfileHeading } from "@/features/profile/coach-display";
import { sortAgeGroupCodes } from "@/lib/football/age-groups";
import type { CoachProfile } from "@/types/database";
import { cn } from "@/lib/utils";

interface CoachCardProps {
  coach: CoachProfile;
  compact?: boolean;
}

export function CoachCard({ coach, compact }: CoachCardProps) {
  const { primary, secondary } = coachProfileHeading(coach);
  const logo = coach.logo_url ?? coach.profiles?.avatar_url;
  const preview = coach.recruiting_needs?.trim();
  const ageCodes = sortAgeGroupCodes(coach.age_groups ?? []).slice(0, compact ? 4 : 6);

  return (
    <Link href={`/profile/coach/${coach.user_id}`} className="block">
      <GlassCard
        className={cn(
          "overflow-hidden p-3 transition-colors hover:border-white/[0.14]",
          compact ? "w-[17rem] shrink-0 lg:w-full lg:shrink" : "w-full"
        )}
      >
        {coach.banner_url ? (
          <div className="relative -mx-3 -mt-3 mb-3 h-16 overflow-hidden bg-[var(--bg-elevated)]">
            <Image
              src={coach.banner_url}
              alt=""
              fill
              className="object-cover opacity-40"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-surface)]" />
          </div>
        ) : null}

        <div className="flex gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--bg-graphite)]">
            {logo ? (
              <Image src={logo} alt={primary} fill className="object-cover" sizes="48px" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{primary}</h3>
              {coach.verified_at ? (
                <VerificationBadge className="mt-0.5 shrink-0" />
              ) : null}
            </div>
            {secondary ? (
              <p className="line-clamp-1 text-sm text-muted-foreground">{secondary}</p>
            ) : null}
            {(coach.league || coach.location) ? (
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                {coach.league ? <span>{coach.league}</span> : null}
                {coach.league && coach.location ? (
                  <span className="text-white/20"> · </span>
                ) : null}
                {coach.location ? (
                  <span className="inline-flex items-center gap-0.5">
                    {!coach.league ? <MapPin className="h-3 w-3 shrink-0" /> : null}
                    {coach.location}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        {ageCodes.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {ageCodes.map((code) => (
              <span
                key={code}
                className="rounded-md border border-white/[0.08] bg-[var(--bg-deep)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground"
              >
                {code}
              </span>
            ))}
            {(coach.age_groups?.length ?? 0) > ageCodes.length ? (
              <span className="rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{(coach.age_groups?.length ?? 0) - ageCodes.length}
              </span>
            ) : null}
          </div>
        ) : null}

        {preview && !compact ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {preview}
          </p>
        ) : null}
      </GlassCard>
    </Link>
  );
}
