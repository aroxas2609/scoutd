import type { CoachProfile } from "@/types/database";
import type { MessageParticipant } from "@/features/messaging/participant-display";

/** Coach personal name vs club — used on profile and in messages. */
export function resolveCoachNames(coach: CoachProfile) {
  const clubName = coach.club_name?.trim() ?? "";
  const storedName = coach.profiles?.full_name?.trim() ?? "";
  const coachName = storedName && storedName !== clubName ? storedName : "";
  return { coachName, clubName };
}

export function coachProfileHeading(coach: CoachProfile) {
  const { coachName, clubName } = resolveCoachNames(coach);
  if (coachName) {
    return {
      primary: coachName,
      secondary: clubName || null,
    };
  }
  return {
    primary: clubName || "Coach",
    secondary: null as string | null,
  };
}

/** Under the club title in Messages — show coach name when set. */
export function messageListSubtitle(participant: MessageParticipant) {
  if (participant.role !== "coach") return null;
  const name = participant.full_name?.trim();
  const club = participant.club_name?.trim();
  if (name && club && name !== club) return name;
  return null;
}
