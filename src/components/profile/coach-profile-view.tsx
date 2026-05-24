"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { navigateProfileBack } from "@/lib/navigation/navigate-profile-back";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { ReportBlockMenu } from "@/components/moderation/report-block-menu";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { CoachProfileEditDialog } from "@/components/profile/coach-profile-edit-dialog";
import { ChangePasswordSection } from "@/components/auth/change-password-section";
import { DeleteAccountSection } from "@/components/auth/delete-account-section";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MessagePlayerButton } from "@/components/messaging/message-player-button";
import { coachProfileHeading } from "@/features/profile/coach-display";
import { ProfileDetailRow, ProfileSection } from "@/components/profile/profile-detail-row";
import { ProfileDetailLinkRow } from "@/components/profile/profile-detail-link-row";
import {
  ProfileAccountSection,
  ProfileSettingsCard,
  ProfileSettingsRow,
} from "@/components/profile/profile-settings";
import { CoachAgeGroupsCard } from "@/components/profile/coach-age-groups-card";
import { ProfileDetailHeader } from "@/components/profile/profile-detail-header";
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
  const pathname = usePathname();
  const heading = coachProfileHeading(coach);
  const logo = coach.logo_url ?? coach.profiles?.avatar_url;

  const hasContact =
    coach.address ||
    coach.contact_email ||
    coach.contact_phone ||
    coach.contact_phone_alt;

  return (
    <div className="pb-28 lg:mx-auto lg:max-w-5xl lg:pb-8">
      <ProfileDetailHeader>
        <button
          type="button"
          onClick={() =>
            navigateProfileBack(router, { currentPath: pathname, fallback: "/search" })
          }
          className="flex h-11 w-11 min-h-11 min-w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-surface)] active:scale-[0.98]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {!isOwn ? (
          <ReportBlockMenu userId={coach.user_id} />
        ) : (
          <div className="h-11 w-11 shrink-0" aria-hidden />
        )}
      </ProfileDetailHeader>

      {coach.banner_url ? (
        <div className="relative mx-4 mt-4 aspect-[2.2/1] overflow-hidden rounded-2xl bg-[var(--bg-elevated)] lg:mx-6 lg:aspect-[21/9] lg:rounded-3xl">
          <Image
            src={coach.banner_url}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/80 to-transparent" />
        </div>
      ) : null}

      <div className={coach.banner_url ? "px-4 pt-4 lg:px-6" : "px-4 pt-6 lg:px-6 lg:pt-8"}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 w-full flex-1 gap-4 lg:gap-6">
          {isOwn ? (
            <ProfilePhotoUpload
              userId={coach.user_id}
              currentUrl={logo}
              variant="coach"
              compact
            />
          ) : (
            <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-[var(--bg-elevated)] lg:h-28 lg:w-28">
              {logo ? (
                <Image
                  src={logo}
                  alt={heading.primary}
                  fill
                  priority={!coach.banner_url}
                  className="object-cover"
                  sizes="88px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight lg:text-3xl">{heading.primary}</h1>
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
          {!isOwn && isPlayerViewer ? (
            <div className="w-full shrink-0 lg:max-w-xs lg:self-start">
              <MessagePlayerButton otherUserId={coach.user_id} layout="default" />
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {hasContact ? (
          <div className="lg:col-span-1">
            <ProfileSection title="Contact">
              <ProfileDetailRow icon={MapPin} label="Address" value={coach.address} />
              {coach.contact_email ? (
                <ProfileDetailLinkRow
                  icon={Mail}
                  label="Email"
                  href={`mailto:${coach.contact_email}`}
                  value={coach.contact_email}
                />
              ) : null}
              {coach.contact_phone ? (
                <ProfileDetailLinkRow
                  icon={Phone}
                  label="Phone"
                  href={telHref(coach.contact_phone)}
                  value={coach.contact_phone}
                />
              ) : null}
              {coach.contact_phone_alt ? (
                <ProfileDetailLinkRow
                  icon={Phone}
                  label="Alt. phone"
                  href={telHref(coach.contact_phone_alt)}
                  value={coach.contact_phone_alt}
                />
              ) : null}
            </ProfileSection>
          </div>
        ) : null}

        {coach.recruiting_needs ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4 lg:col-span-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recruiting needs
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{coach.recruiting_needs}</p>
          </div>
        ) : null}

        {coach.about ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4 lg:col-span-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              About
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{coach.about}</p>
          </div>
        ) : null}

        {coach.age_groups?.length > 0 ? (
          <div className="lg:col-span-2">
            <CoachAgeGroupsCard codes={coach.age_groups} />
          </div>
        ) : null}
        </div>

        {isOwn ? (
          <ProfileAccountSection>
            <ProfileSettingsCard>
              <ProfileSettingsRow
                icon={Bookmark}
                label="Saved players"
                href="/shortlist"
              />
              <CoachProfileEditDialog coach={coach} embedded />
              <ChangePasswordSection embedded />
            </ProfileSettingsCard>
            <SignOutButton />
            <DeleteAccountSection />
          </ProfileAccountSection>
        ) : null}
      </div>
    </div>
  );
}
