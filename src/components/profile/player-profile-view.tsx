"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { navigateProfileBack } from "@/lib/navigation/navigate-profile-back";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { Progress } from "@/components/ui/progress";
import { ReportBlockMenu } from "@/components/moderation/report-block-menu";
import type { PlayerProfile, AvailabilityStatus, UserRole } from "@/types/database";
import {
  ArrowLeft,
  Footprints,
  Mail,
  MapPin,
  Phone,
  Ruler,
  User,
  Briefcase,
  Plane,
  Landmark,
} from "lucide-react";
import { ProfileDetailLinkRow } from "@/components/profile/profile-detail-link-row";
import {
  playerContactEmail,
  playerContactPhone,
  playerHasContactDetails,
  telHref,
} from "@/features/profile/player-contact";
import { PlayerProfileCoachActions } from "@/components/profile/player-profile-coach-actions";
import { PlayerProfilePlayerActions } from "@/components/profile/player-profile-player-actions";
import { ChangePasswordSection } from "@/components/auth/change-password-section";
import { DeleteAccountSection } from "@/components/auth/delete-account-section";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  ProfileAccountSection,
  ProfileSettingsCard,
} from "@/components/profile/profile-settings";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { PlayerProfileEditDialog } from "@/components/profile/player-profile-edit-dialog";
import { PlayerMediaSection } from "@/components/profile/player-media-section";
import { ProfileDetailRow, ProfileSection } from "@/components/profile/profile-detail-row";
import { ProfileDetailHeader } from "@/components/profile/profile-detail-header";
import { cn } from "@/lib/utils";

interface PlayerProfileViewProps {
  player: PlayerProfile;
  isOwn?: boolean;
  viewerRole?: UserRole | null;
}

function formatExperience(level: string | null | undefined) {
  if (!level) return null;
  return level.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProfileCompletionCard({ score }: { score: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] px-4 py-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Profile completion</span>
        <span className="font-medium text-foreground">{score}%</span>
      </div>
      <Progress value={score} className="mt-2 h-1.5" />
    </div>
  );
}

function PlayerAccountSettings({
  player,
  className,
}: {
  player: PlayerProfile;
  className?: string;
}) {
  return (
    <ProfileAccountSection className={className}>
      <ProfileSettingsCard>
        <PlayerProfileEditDialog player={player} embedded />
        <ChangePasswordSection embedded />
      </ProfileSettingsCard>
      <SignOutButton />
      <DeleteAccountSection />
    </ProfileAccountSection>
  );
}

export function PlayerProfileView({ player, isOwn, viewerRole }: PlayerProfileViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isCoachViewer = viewerRole === "coach";
  const isPlayerViewer = viewerRole === "player";
  const name = player.profiles?.full_name ?? "Player";
  const availability = (player.availability ?? "available") as AvailabilityStatus;

  const metaParts = [
    player.position,
    player.age != null ? `${player.age} yrs` : null,
    player.current_club,
  ].filter(Boolean);

  const districtName = player.associations?.name ?? null;

  const hasOverviewDetails =
    player.location_public ||
    districtName ||
    player.height_cm ||
    player.dominant_foot ||
    player.experience_level ||
    player.willing_to_travel != null;

  const overviewTwoCol = !isOwn || (player.achievements?.length ?? 0) > 0;
  const showContactToCoach = !isOwn && isCoachViewer;
  const contactEmail = showContactToCoach ? playerContactEmail(player) : null;
  const contactPhone = showContactToCoach ? playerContactPhone(player) : null;

  return (
    <div
      className={cn(
        "pb-28 lg:mx-auto lg:pb-8",
        isOwn ? "lg:max-w-6xl" : "lg:max-w-5xl"
      )}
    >
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
          <ReportBlockMenu userId={player.user_id} />
        ) : (
          <div className="h-11 w-11 shrink-0" aria-hidden />
        )}
      </ProfileDetailHeader>

      <div className="px-4 pt-6 lg:px-6 lg:pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 w-full flex-1 gap-4 lg:gap-6">
            {isOwn ? (
              <ProfilePhotoUpload
                userId={player.user_id}
                currentUrl={player.profiles?.avatar_url}
                variant="player"
                compact
              />
            ) : (
              <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-[var(--bg-elevated)] lg:h-28 lg:w-28">
                {player.profiles?.avatar_url ? (
                  <Image
                    src={player.profiles.avatar_url}
                    alt={name}
                    fill
                    priority
                    className="object-cover"
                    sizes="88px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User className="h-9 w-9 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold leading-tight tracking-tight lg:text-3xl">
                  {name}
                </h1>
                {player.verified_at ? <VerificationBadge /> : null}
              </div>
              {metaParts.length > 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">{metaParts.join(" · ")}</p>
              ) : null}
              <div className="mt-3">
                <AvailabilityBadge status={availability} />
              </div>
            </div>
          </div>
          {!isOwn && isCoachViewer ? (
            <div className="w-full shrink-0 lg:max-w-xs lg:self-start">
              <PlayerProfileCoachActions playerId={player.user_id} />
            </div>
          ) : null}
          {!isOwn && isPlayerViewer ? (
            <div className="w-full shrink-0 lg:max-w-xs lg:self-start">
              <PlayerProfilePlayerActions playerId={player.user_id} />
            </div>
          ) : null}
        </div>

        {isOwn ? (
          <div className="mt-5 lg:hidden">
            <ProfileCompletionCard score={player.completion_score} />
          </div>
        ) : null}

        <div
          className={cn(
            isOwn &&
              "lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-10"
          )}
        >
          <div className="min-w-0">
            <Tabs defaultValue="overview" className="mt-6 lg:mt-0">
            <TabsList
              variant="line"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[var(--bg-graphite)] p-1"
            >
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-lg data-active:bg-white/[0.08] data-active:text-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="flex-1 rounded-lg data-active:bg-white/[0.08] data-active:text-foreground"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="flex-1 rounded-lg data-active:bg-white/[0.08] data-active:text-foreground"
              >
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className={cn(
                "mt-4 space-y-4",
                overviewTwoCol &&
                  "lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0",
                isOwn && !overviewTwoCol && "lg:max-w-2xl"
              )}
            >
              {showContactToCoach ? (
                <ProfileSection
                  title="Contact"
                  className={overviewTwoCol ? "lg:col-span-1" : undefined}
                >
                  {contactEmail ? (
                    <ProfileDetailLinkRow
                      icon={Mail}
                      label="Email"
                      href={`mailto:${contactEmail}`}
                      value={contactEmail}
                    />
                  ) : null}
                  {contactPhone ? (
                    <ProfileDetailLinkRow
                      icon={Phone}
                      label="Phone"
                      href={telHref(contactPhone)}
                      value={contactPhone}
                    />
                  ) : null}
                  {!playerHasContactDetails(player) ? (
                    <p className="py-3 text-sm text-muted-foreground">
                      This player has not added contact details yet. Send a message to get in
                      touch.
                    </p>
                  ) : null}
                </ProfileSection>
              ) : null}

              {hasOverviewDetails ? (
                <ProfileSection
                  title="Details"
                  className={overviewTwoCol ? "lg:col-span-1" : undefined}
                >
                  <ProfileDetailRow
                    icon={MapPin}
                    label="Suburb"
                    value={player.location_public}
                  />
                  <ProfileDetailRow
                    icon={Landmark}
                    label="District"
                    value={districtName}
                  />
                  <ProfileDetailRow
                    icon={Ruler}
                    label="Height"
                    value={player.height_cm ? `${player.height_cm} cm` : null}
                  />
                  <ProfileDetailRow
                    icon={Footprints}
                    label="Dominant foot"
                    value={player.dominant_foot ? `${player.dominant_foot} foot` : null}
                  />
                  <ProfileDetailRow
                    icon={Briefcase}
                    label="Experience"
                    value={formatExperience(player.experience_level)}
                  />
                  <ProfileDetailRow
                    icon={Plane}
                    label="Willing to travel"
                    value={
                      player.willing_to_travel == null
                        ? null
                        : player.willing_to_travel
                          ? "Yes"
                          : "No"
                    }
                  />
                </ProfileSection>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-8 text-center text-sm text-muted-foreground lg:col-span-2">
                  No details added yet.
                </p>
              )}

              {player.achievements?.length > 0 ? (
                <ProfileSection title="Achievements" className="lg:col-span-1">
                  {player.achievements.map((a, i) => (
                    <ProfileDetailRow
                      key={i}
                      label={a.title}
                      value={a.year ? String(a.year) : "—"}
                    />
                  ))}
                </ProfileSection>
              ) : null}
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              <PlayerMediaSection
                player={player}
                isOwn={!!isOwn}
                className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0"
              />
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div
                className={cn(
                  "rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4",
                  isOwn ? "lg:max-w-2xl" : "lg:max-w-3xl"
                )}
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  {player.bio?.trim() || "This player has not added a bio yet."}
                </p>
              </div>
            </TabsContent>
          </Tabs>

            {isOwn ? (
              <div className="mt-8 lg:hidden">
                <PlayerAccountSettings player={player} />
              </div>
            ) : null}
          </div>

          {isOwn ? (
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:space-y-5 lg:self-start">
              <ProfileCompletionCard score={player.completion_score} />
              <PlayerAccountSettings player={player} className="mt-0" />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
