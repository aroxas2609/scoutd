-- Contact details for player profiles (visible to coaches on profile view)
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
