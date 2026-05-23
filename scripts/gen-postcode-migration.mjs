import { readFileSync, writeFileSync } from "fs";
const src = readFileSync("src/data/postcode-centroids-nsw.ts", "utf8");
const re = /"(\d{4})":\s*\{\s*lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+),\s*suburb:\s*"([^"]+)"\s*\}/g;
const rows = [];
let m;
while ((m = re.exec(src))) {
  rows.push(`  ('${m[1]}', '${m[4].replace(/'/g, "''")}', 'NSW', ${m[2]}, ${m[3]})`);
}
const sql = `-- Phase 3: postcode centroids for radius search (starter seed; extend mapping here)

CREATE TABLE postcode_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postcode TEXT NOT NULL,
  suburb TEXT,
  state TEXT NOT NULL DEFAULT 'NSW',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_postcode_locations_postcode ON postcode_locations(postcode);

INSERT INTO postcode_locations (postcode, suburb, state, latitude, longitude) VALUES
${rows.join(",\n")};

ALTER TABLE postcode_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Postcode locations are publicly readable"
  ON postcode_locations FOR SELECT
  USING (true);
`;
writeFileSync("supabase/migrations/016_postcode_locations.sql", sql);
console.log("Wrote", rows.length, "rows");
