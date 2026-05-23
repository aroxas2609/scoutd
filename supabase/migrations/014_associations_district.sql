-- District / association lookup for Metro NSW player-coach matching

CREATE TABLE associations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'Metro Association',
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO associations (id, name, type, contact_name, phone, email, website_url, logo_url) VALUES
  ('a1000001-0001-4001-8001-000000000001', 'Bankstown FA', 'Metro Association', 'Leanne Millar', '(02) 9771 3322', 'leanne@bdafa.com.au', NULL, '/logos/bankstown-fa.png'),
  ('a1000001-0001-4001-8001-000000000002', 'Blacktown District', 'Metro Association', 'Alex Hanna', '(02) 9675 1211', 'admin@bdsfa.com', NULL, '/logos/blacktown-district.png'),
  ('a1000001-0001-4001-8001-000000000003', 'Canterbury DSFA', 'Metro Association', 'Trent Thomas', '(02) 9716 8558', 'admin@footballcanterbury.com.au', NULL, '/logos/canterbury-dsfa.png'),
  ('a1000001-0001-4001-8001-000000000004', 'Central Coast Football', 'Metro Association', 'Alex Burgin', '(02) 4362 4300', 'admin@ccfootball.com.au', NULL, '/logos/central-coast-football.png'),
  ('a1000001-0001-4001-8001-000000000005', 'Eastern Suburbs FA', 'Metro Association', 'John Boulos', '(02) 8347 8800', 'info@esfa.com.au', NULL, '/logos/eastern-suburbs-fa.png'),
  ('a1000001-0001-4001-8001-000000000006', 'Football South Coast', 'Metro Association', 'Sonya Keir', '(02) 4285 6929', 'admin@footballsouthcoast.com', NULL, '/logos/football-south-coast.png'),
  ('a1000001-0001-4001-8001-000000000007', 'Football St George', 'Metro Association', 'Zoe Braithwaite', '(02) 9556 3055', 'info@footballstgeorge.com.au', NULL, '/logos/football-st-george.png'),
  ('a1000001-0001-4001-8001-000000000008', 'Granville & Districts SFA', 'Metro Association', 'Rosanna Lentini', '0436 481 296', 'office@granvillesoccer.com.au', NULL, '/logos/granville-districts-sfa.png'),
  ('a1000001-0001-4001-8001-000000000009', 'Hills Football', 'Metro Association', 'Jeremy Toivonen', 'N/A', 'office@hillsfootball.com.au', NULL, '/logos/hills-football.png'),
  ('a1000001-0001-4001-8001-00000000000a', 'Macarthur District', 'Metro Association', 'Paul Bertolissio', '(02) 4625 1333', 'gm@macarthursoccer.com.au', NULL, '/logos/macarthur-district.png'),
  ('a1000001-0001-4001-8001-00000000000b', 'Manly Warringah', 'Metro Association', 'Lee-Anne Sestanovich', '(02) 9982 6228', 'admin@mwfa.com.au', NULL, '/logos/manly-warringah.png'),
  ('a1000001-0001-4001-8001-00000000000c', 'Nepean District FA', 'Metro Association', 'Linda Cerone', '(02) 4731 2911', 'admin@nepeanfootball.com.au', NULL, '/logos/nepean-district-fa.png'),
  ('a1000001-0001-4001-8001-00000000000d', 'North West Sydney Football Ltd', 'Metro Association', 'Phil Brown', '(02) 9887 2116', 'nwsf@nwsf.com.au', NULL, '/logos/north-west-sydney-football.png'),
  ('a1000001-0001-4001-8001-00000000000e', 'Northern Suburbs', 'Metro Association', 'David Taylor', '(02) 9449 4933', 'admin@nsfa.asn.au', NULL, '/logos/northern-suburbs.png'),
  ('a1000001-0001-4001-8001-00000000000f', 'Southern Districts', 'Metro Association', 'Admin', 'N/A', 'admin@sdsfa.com', NULL, '/logos/southern-districts.png'),
  ('a1000001-0001-4001-8001-000000000010', 'Sutherland Shire Football', 'Metro Association', 'Jeff Stewart', '(02) 9542 3577', 'office@shirefootball.com', NULL, '/logos/sutherland-shire-football.png');

ALTER TABLE player_profiles
  ADD COLUMN association_id UUID REFERENCES associations(id) ON DELETE SET NULL;

ALTER TABLE coach_profiles
  ADD COLUMN association_id UUID REFERENCES associations(id) ON DELETE SET NULL;

CREATE INDEX idx_player_association_id ON player_profiles(association_id);
CREATE INDEX idx_coach_association_id ON coach_profiles(association_id);

UPDATE coach_profiles cp
SET association_id = a.id
FROM associations a
WHERE cp.league = a.name;

ALTER TABLE associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Associations are publicly readable"
  ON associations FOR SELECT
  USING (true);
