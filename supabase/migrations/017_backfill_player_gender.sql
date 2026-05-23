-- Backfill gender on existing player profiles (starter data for filter testing)

UPDATE player_profiles SET gender = 'female'
WHERE user_id = 'ced807f1-d911-457c-bad9-0369fb94a7db';

UPDATE player_profiles SET gender = 'female'
WHERE user_id = 'caddb0e3-dd44-4bbf-8554-01780742ad8a';

UPDATE player_profiles SET gender = 'female'
WHERE user_id = '95ba0731-af34-44f1-9441-2421649a2a11';

UPDATE player_profiles SET gender = 'male'
WHERE user_id = '8b34d157-e6a1-48db-b5bc-d03c46b76e65';

-- Any other profiles without gender: alternate for local testing
WITH numbered AS (
  SELECT user_id, ROW_NUMBER() OVER (ORDER BY user_id) AS rn
  FROM player_profiles
  WHERE gender IS NULL
)
UPDATE player_profiles p
SET gender = CASE WHEN n.rn % 2 = 1 THEN 'female' ELSE 'male' END
FROM numbered n
WHERE p.user_id = n.user_id;
