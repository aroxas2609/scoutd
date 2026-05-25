-- Mock FFA numbers for all existing player profiles (local / demo testing)

WITH players AS (
  SELECT
    pp.user_id,
    ROW_NUMBER() OVER (ORDER BY pp.user_id) AS rn
  FROM player_profiles pp
)
UPDATE player_profiles pp
SET ffa_number = LPAD((10000000 + p.rn)::text, 8, '0')
FROM players p
WHERE pp.user_id = p.user_id;
