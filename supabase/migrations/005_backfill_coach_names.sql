-- Backfill coach display names from club name (run once in SQL Editor)
UPDATE profiles p
SET full_name = c.club_name
FROM coach_profiles c
WHERE p.id = c.user_id
  AND p.role = 'coach'
  AND (p.full_name IS NULL OR trim(p.full_name) = '')
  AND c.club_name IS NOT NULL
  AND trim(c.club_name) <> '';
