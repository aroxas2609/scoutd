-- Scoutd initial schema

CREATE TYPE user_role AS ENUM ('player', 'coach', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'open_to_offers', 'not_available');
CREATE TYPE experience_level AS ENUM ('academy', 'semi_pro', 'professional', 'amateur');
CREATE TYPE dominant_foot AS ENUM ('left', 'right', 'both');
CREATE TYPE message_type AS ENUM ('text', 'trial_invite', 'system');
CREATE TYPE trial_status AS ENUM ('pending', 'accepted', 'declined', 'maybe');
CREATE TYPE notification_type AS ENUM ('new_message', 'trial_invite', 'profile_viewed', 'shortlisted', 'verification');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_status AS ENUM ('open', 'resolved', 'dismissed');
CREATE TYPE conversation_status AS ENUM ('active', 'pending');
CREATE TYPE featured_entity_type AS ENUM ('player', 'club');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE player_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  cover_url TEXT,
  age INT CHECK (age >= 14 AND age <= 50),
  location TEXT,
  location_public TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  position TEXT,
  secondary_positions TEXT[] DEFAULT '{}',
  dominant_foot dominant_foot,
  height_cm INT,
  current_club TEXT,
  experience_level experience_level,
  availability availability_status DEFAULT 'available',
  bio TEXT,
  achievements JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  playing_level TEXT,
  willing_to_travel BOOLEAN DEFAULT FALSE,
  gender TEXT,
  completion_score INT DEFAULT 0,
  verified_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  has_highlights BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE coach_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  club_name TEXT,
  logo_url TEXT,
  banner_url TEXT,
  league TEXT,
  age_groups TEXT[] DEFAULT '{}',
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  recruiting_needs TEXT,
  about TEXT,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE saved_players (
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (coach_id, player_id)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status conversation_status DEFAULT 'pending' NOT NULL
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  type message_type DEFAULT 'text' NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE trial_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status trial_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  status verification_status DEFAULT 'pending' NOT NULL,
  documents JSONB DEFAULT '{}',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status report_status DEFAULT 'open' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE blocks (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE featured_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type featured_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  sort_order INT DEFAULT 0,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_player_position ON player_profiles(position);
CREATE INDEX idx_player_availability ON player_profiles(availability);
CREATE INDEX idx_player_experience ON player_profiles(experience_level);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Player profiles
CREATE POLICY "Public player profiles read" ON player_profiles FOR SELECT USING (true);
CREATE POLICY "Players update own profile" ON player_profiles FOR ALL USING (auth.uid() = user_id);

-- Coach profiles
CREATE POLICY "Public coach profiles read" ON coach_profiles FOR SELECT USING (true);
CREATE POLICY "Coaches update own profile" ON coach_profiles FOR ALL USING (auth.uid() = user_id);

-- Saved players
CREATE POLICY "Coaches manage saved players" ON saved_players FOR ALL USING (auth.uid() = coach_id);

-- Conversations
CREATE POLICY "Participants read conversations" ON conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Participants
CREATE POLICY "Participants read own" ON conversation_participants FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
  ));

CREATE POLICY "Insert participants" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update own participant" ON conversation_participants FOR UPDATE USING (user_id = auth.uid());

-- Messages
CREATE POLICY "Participants read messages" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Participants send messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
    )
  );

-- Trial invites
CREATE POLICY "Trial invite read" ON trial_invites FOR SELECT
  USING (auth.uid() = coach_id OR auth.uid() = player_id);

CREATE POLICY "Coach create trial invite" ON trial_invites FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Player update trial status" ON trial_invites FOR UPDATE
  USING (auth.uid() = player_id OR auth.uid() = coach_id);

-- Notifications
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Verification
CREATE POLICY "Own verification requests" ON verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Create verification" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports
CREATE POLICY "Create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Read own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Blocks
CREATE POLICY "Manage blocks" ON blocks FOR ALL USING (auth.uid() = blocker_id);

-- Featured
CREATE POLICY "Public featured" ON featured_entities FOR SELECT USING (true);

-- Profile views
CREATE POLICY "Insert profile views" ON profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Storage buckets (run in Supabase dashboard or via API)
-- avatars, banners, highlights, club-assets
