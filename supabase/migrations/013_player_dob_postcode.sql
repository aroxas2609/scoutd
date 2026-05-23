-- Date of birth (age is still stored for filters/display, computed on save)
ALTER TABLE player_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS postcode TEXT;

ALTER TABLE coach_profiles
  ADD COLUMN IF NOT EXISTS postcode TEXT;
