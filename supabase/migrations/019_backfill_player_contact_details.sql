-- Mock contact details for all existing player profiles (local / demo testing)

WITH players AS (
  SELECT
    pp.user_id,
    pr.full_name,
    ROW_NUMBER() OVER (ORDER BY pp.user_id) AS rn
  FROM player_profiles pp
  JOIN profiles pr ON pr.id = pp.user_id
)
UPDATE player_profiles pp
SET
  contact_email = LOWER(
    REGEXP_REPLACE(
      COALESCE(NULLIF(TRIM(p.full_name), ''), 'player'),
      '[^a-zA-Z0-9]+',
      '.',
      'g'
    )
  ) || '.player' || p.rn::text || '@scoutd.test',
  contact_phone =
    '04'
    || LPAD((10 + (p.rn % 89))::text, 2, '0')
    || ' '
    || LPAD((100 + (p.rn * 7 % 900))::text, 3, '0')
    || ' '
    || LPAD((100 + (p.rn * 13 % 900))::text, 3, '0')
FROM players p
WHERE pp.user_id = p.user_id;
