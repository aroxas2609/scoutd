"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import { Progress } from "@/components/ui/progress";
import { ReportBlockMenu } from "@/components/moderation/report-block-menu";
import type { PlayerProfile, AvailabilityStatus, UserRole } from "@/types/database";
import {
  ArrowLeft,
  Footprints,
  MapPin,
  Ruler,
  User,
  Briefcase,
  Plane,
  Landmark,
} from "lucide-react";
import { PlayerProfileCoachActions } from "@/components/profile/player-profile-coach-actions";
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

interface PlayerProfileViewProps {
  player: PlayerProfile;
  isOwn?: boolean;
  viewerRole?: UserRole | null;
}

function formatExperience(level: string | null | undefined) {
  if (!level) return null;
  return level.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlayerProfileView({ player, isOwn, viewerRole }: PlayerProfileViewProps) {
  const router = useRouter();
  const isCoachViewer = viewerRole === "coach";
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

  return (
    <div className="pb-28 lg:mx-auto lg:max-w-5xl lg:pb-8">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md lg:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-surface)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {!isOwn ? <ReportBlockMenu userId={player.user_id} /> : <div className="w-10" />}
      </div>

      <div className="px-4 pt-6 lg:px-6 lg:pt-8">
        <div className="flex gap-4 lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 lg:gap-6">
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
              <h1 className="text-xl font-semibold leading-tight tracking-tight lg:text-3xl">{name}</h1>
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
            <div className="mt-4 shrink-0 lg:mt-0 lg:max-w-xs lg:self-start">
              <PlayerProfileCoachActions playerId={player.user_id} />
            </div>
          ) : null}
        </div>

        {isOwn ? (
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Profile completion</span>
              <span className="font-medium text-foreground">{player.completion_score}%</span>
            </div>
            <Progress value={player.completion_score} className="mt-2 h-1.5" />
          </div>
        ) : null}

        <Tabs defaultValue="overview" className="mt-6 lg:mt-8">
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

          <TabsContent value="overview" className="mt-4 space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
            {hasOverviewDetails ? (
              <ProfileSection title="Details" className="lg:col-span-1">
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
                <ProfileDetailRow icon={Ruler} label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
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
              <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-8 text-center text-sm text-muted-foreground">
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
            <PlayerMediaSection player={player} isOwn={!!isOwn} />
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4">
              <p className="text-sm leading-relaxed text-foreground/90">
                {player.bio?.trim() || "This player has not added a bio yet."}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {isOwn ? (
          <ProfileAccountSection>
            <ProfileSettingsCard>
              <PlayerProfileEditDialog player={player} embedded />
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
