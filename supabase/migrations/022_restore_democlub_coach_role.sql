-- Restore demo club account to coach (run in Supabase SQL Editor if needed)
UPDATE profiles
SET
  role = 'coach',
  onboarding_complete = true
WHERE lower(email) IN ('democlub@scoutd.com', 'democlub@soutd.com');
