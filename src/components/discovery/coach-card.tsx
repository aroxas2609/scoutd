"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { coachProfileHeading } from "@/features/profile/coach-display";
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

  return (
    <Link href={`/profile/coach/${coach.user_id}`} className="block">
      <GlassCard
        className={cn(
          "overflow-hidden transition-colors hover:border-white/[0.14]",
          compact ? "w-64 shrink-0" : "w-full"
        )}
      >
        <div className="relative aspect-[16/10] bg-[var(--bg-elevated)]">
          {coach.banner_url ? (
            <Image src={coach.banner_url} alt="" fill className="object-cover opacity-30" sizes="(max-width: 512px) 100vw, 512px" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-[var(--bg-deep)]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end gap-3">
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
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">{primary}</h3>
                  {coach.verified_at ? <VerificationBadge /> : null}
                </div>
                {secondary ? (
                  <p className="truncate text-sm text-muted-foreground">{secondary}</p>
                ) : null}
                {(coach.league || coach.location) && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    {coach.league ? <span>{coach.league}</span> : null}
                    {coach.location ? (
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {coach.location}
                      </span>
                    ) : null}
                  </p>
                )}
              </div>
            </div>
            {coach.age_groups?.length > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {coach.age_groups.slice(0, 3).join(" · ")}
              </p>
            ) : null}
            {preview && !compact ? (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {preview}
              </p>
            ) : null}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
