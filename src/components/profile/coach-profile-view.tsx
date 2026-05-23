"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { ReportBlockMenu } from "@/components/moderation/report-block-menu";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { CoachProfileEditDialog } from "@/components/profile/coach-profile-edit-dialog";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MessagePlayerButton } from "@/components/messaging/message-player-button";
import { coachProfileHeading } from "@/features/profile/coach-display";
import { ProfileDetailRow, ProfileSection } from "@/components/profile/profile-detail-row";
import type { CoachProfile } from "@/types/database";

type Props = {
  coach: CoachProfile;
  isOwn: boolean;
  isPlayerViewer: boolean;
};

function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function CoachProfileView({ coach, isOwn, isPlayerViewer }: Props) {
  const router = useRouter();
  const heading = coachProfileHeading(coach);
  const logo = coach.logo_url ?? coach.profiles?.avatar_url;

  const hasContact =
    coach.address ||
    coach.contact_email ||
    coach.contact_phone ||
    coach.contact_phone_alt;

  return (
    <div className="pb-28">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-surface)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {!isOwn ? <ReportBlockMenu userId={coach.user_id} /> : <div className="w-10" />}
      </div>

      {coach.banner_url ? (
        <div className="relative mx-4 mt-4 aspect-[2.2/1] overflow-hidden rounded-2xl bg-[var(--bg-elevated)]">
          <Image
            src={coach.banner_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/80 to-transparent" />
        </div>
      ) : null}

      <div className={coach.banner_url ? "px-4 pt-4" : "px-4 pt-6"}>
        <div className="flex gap-4">
          {isOwn ? (
            <ProfilePhotoUpload
              userId={coach.user_id}
              currentUrl={logo}
              variant="coach"
              compact
            />
          ) : (
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-[var(--bg-elevated)]">
              {logo ? (
                <Image src={logo} alt={heading.primary} fill className="object-cover" sizes="88px" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">{heading.primary}</h1>
              {coach.verified_at ? <VerificationBadge /> : null}
            </div>
            {heading.secondary ? (
              <p className="mt-1 text-sm text-muted-foreground">{heading.secondary}</p>
            ) : null}
            {(coach.league || coach.location) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[coach.league, coach.location].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {hasContact ? (
          <div className="mt-6">
            <ProfileSection title="Contact">
              <ProfileDetailRow icon={MapPin} label="Address" value={coach.address} />
              {coach.contact_email ? (
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0 opacity-70" />
                    Email
                  </span>
                  <Link
                    href={`mailto:${coach.contact_email}`}
                    className="max-w-[58%] truncate text-right text-sm font-medium text-[var(--accent-brand)]"
                  >
                    {coach.contact_email}
                  </Link>
                </div>
              ) : null}
              {coach.contact_phone ? (
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 opacity-70" />
                    Phone
                  </span>
                  <Link
                    href={telHref(coach.contact_phone)}
                    className="text-right text-sm font-medium text-[var(--accent-brand)]"
                  >
                    {coach.contact_phone}
                  </Link>
                </div>
              ) : null}
              {coach.contact_phone_alt ? (
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0 opacity-70" />
                    Alt. phone
                  </span>
                  <Link
                    href={telHref(coach.contact_phone_alt)}
                    className="text-right text-sm font-medium text-[var(--accent-brand)]"
                  >
                    {coach.contact_phone_alt}
                  </Link>
                </div>
              ) : null}
            </ProfileSection>
          </div>
        ) : null}

        {coach.recruiting_needs ? (
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recruiting needs
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{coach.recruiting_needs}</p>
          </div>
        ) : null}

        {coach.about ? (
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              About
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{coach.about}</p>
          </div>
        ) : null}

        {coach.age_groups?.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {coach.age_groups.map((g) => (
              <span
                key={g}
                className="rounded-lg border border-white/[0.08] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-muted-foreground"
              >
                {g}
              </span>
            ))}
          </div>
        ) : null}

        {!isOwn && isPlayerViewer ? (
          <div className="mt-6">
            <MessagePlayerButton playerId={coach.user_id} />
          </div>
        ) : null}

        {isOwn ? (
          <div className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
            <Link
              href="/shortlist"
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] px-4 py-3.5 text-sm font-medium transition-colors hover:bg-white/[0.04]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                  <Bookmark className="h-4 w-4 text-[var(--accent-brand)]" />
                </span>
                Saved players
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <CoachProfileEditDialog coach={coach} />
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </div>
  );
}
