export type UserRole = "player" | "coach" | "admin";

export type AvailabilityStatus =
  | "available"
  | "open_to_offers"
  | "not_available";

export type ExperienceLevel =
  | "academy"
  | "semi_pro"
  | "professional"
  | "amateur";

export type DominantFoot = "left" | "right" | "both";

export type PlayerGender = "female" | "male";

export type MessageType = "text" | "trial_invite" | "system";

export type TrialStatus = "pending" | "accepted" | "declined" | "maybe";

export type NotificationType =
  | "new_message"
  | "trial_invite"
  | "profile_viewed"
  | "shortlisted"
  | "verification";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type ReportStatus = "open" | "resolved" | "dismissed";

export interface Association {
  id: string;
  name: string;
  type: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface AssociationPostcode {
  id: string;
  association_id: string;
  postcode: string;
  suburb: string | null;
  state: string;
  created_at: string;
}

export interface PostcodeLocation {
  id: string;
  postcode: string;
  suburb: string | null;
  state: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

/** Player with computed distance (not persisted). */
export type PlayerWithDistance = PlayerProfile & { distanceKm?: number };

export interface Profile {
  id: string;
  role: UserRole | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_active_at: string | null;
  onboarding_complete: boolean;
}

export interface PlayerProfile {
  user_id: string;
  cover_url: string | null;
  age: number | null;
  date_of_birth: string | null;
  suburb: string | null;
  postcode: string | null;
  location: string | null;
  location_public: string | null;
  latitude: number | null;
  longitude: number | null;
  position: string | null;
  secondary_positions: string[];
  dominant_foot: DominantFoot | null;
  height_cm: number | null;
  current_club: string | null;
  experience_level: ExperienceLevel | null;
  availability: AvailabilityStatus | null;
  bio: string | null;
  achievements: { title: string; year?: string }[];
  social_links: Record<string, string | string[]>;
  playing_level: string | null;
  willing_to_travel: boolean;
  gender: PlayerGender | null;
  completion_score: number;
  verified_at: string | null;
  featured_until: string | null;
  has_highlights: boolean;
  association_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  associations?: { name: string } | null;
  profiles?: Profile;
}

export interface CoachProfile {
  user_id: string;
  club_name: string | null;
  logo_url: string | null;
  banner_url: string | null;
  league: string | null;
  age_groups: string[];
  location: string | null;
  suburb: string | null;
  postcode: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_phone_alt: string | null;
  latitude: number | null;
  longitude: number | null;
  recruiting_needs: string | null;
  about: string | null;
  verified_at: string | null;
  association_id: string | null;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  status: "active" | "pending";
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  type: MessageType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TrialInvite {
  id: string;
  coach_id: string;
  player_id: string;
  conversation_id: string | null;
  scheduled_at: string;
  location: string;
  notes: string | null;
  status: TrialStatus;
  coach_archived_at?: string | null;
  player_archived_at?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface PlayerSearchFilters {
  query?: string;
  ageMin?: number;
  ageMax?: number;
  position?: string;
  foot?: DominantFoot;
  availability?: AvailabilityStatus;
  experienceLevel?: ExperienceLevel;
  willingToTravel?: boolean;
  gender?: PlayerGender;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
  sortByNearest?: boolean;
  /** Club postcode — always included in nearby postcode radius SQL */
  originPostcode?: string;
  /** Set when coach enables My District filter */
  coachAssociationId?: string;
}

export interface CoachSearchFilters {
  query?: string;
  location?: string;
  league?: string;
}
