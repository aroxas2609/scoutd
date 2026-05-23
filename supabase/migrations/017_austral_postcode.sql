-- Austral (2179) and adjacent Western Sydney postcodes missing from initial seed

INSERT INTO postcode_locations (postcode, suburb, state, latitude, longitude) VALUES
  ('2179', 'Austral', 'NSW', -33.9339, 150.8174),
  ('2178', 'Cecil Park', 'NSW', -33.8985, 150.8055),
  ('2177', 'Bonnyrigg Heights', 'NSW', -33.9012, 150.8785)
ON CONFLICT (postcode) DO UPDATE SET
  suburb = EXCLUDED.suburb,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;
