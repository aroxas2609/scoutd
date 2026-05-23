-- Club contact details for coach profiles
-- Run in Supabase SQL Editor

ALTER TABLE coach_profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_phone_alt TEXT;
