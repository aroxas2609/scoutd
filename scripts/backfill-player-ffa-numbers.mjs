/**
 * Backfill mock FFA# on all player_profiles (matches 025_backfill_player_ffa_numbers.sql).
 * Usage: node scripts/backfill-player-ffa-numbers.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const name of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(process.cwd(), name), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!env[key]) env[key] = val;
      }
    } catch {
      /* try next file */
    }
  }
  return env;
}

function mockFfaNumber(indexOneBased) {
  return String(10_000_000 + indexOneBased).padStart(8, "0");
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: players, error } = await admin
    .from("player_profiles")
    .select("user_id")
    .order("user_id", { ascending: true });

  if (error) {
    console.error("Failed to list players:", error.message);
    process.exit(1);
  }

  if (!players?.length) {
    console.log("No player profiles found.");
    return;
  }

  let updated = 0;
  for (let i = 0; i < players.length; i++) {
    const ffa_number = mockFfaNumber(i + 1);
    const { error: updateError } = await admin
      .from("player_profiles")
      .update({ ffa_number })
      .eq("user_id", players[i].user_id);

    if (updateError) {
      console.error(`Failed for ${players[i].user_id}:`, updateError.message);
      process.exit(1);
    }
    updated++;
  }

  console.log(`Updated FFA# on ${updated} player profile(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
