-- FFA registration number (optional; coaches use for verification)
ALTER TABLE player_profiles
ADD COLUMN IF NOT EXISTS ffa_number TEXT;
