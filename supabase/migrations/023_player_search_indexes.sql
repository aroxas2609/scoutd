-- Player search and nearby performance indexes

CREATE INDEX IF NOT EXISTS idx_player_profiles_postcode ON player_profiles(postcode);
CREATE INDEX IF NOT EXISTS idx_player_profiles_updated_at ON player_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_profiles_lat_lng
  ON player_profiles(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
  ON profiles USING gin (full_name gin_trgm_ops);
