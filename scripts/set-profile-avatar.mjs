/**
 * Set a user's profile avatar from a local image file.
 * Usage: node scripts/set-profile-avatar.mjs "Ryan Neri" path/to/image.png
 */
import { readFileSync, existsSync } from "fs";
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

async function findProfile(admin, fullName) {
  const { data: rows, error } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .ilike("full_name", fullName);

  if (error) throw error;
  if (rows?.length === 1) return rows[0];
  if (rows && rows.length > 1) {
    console.error("Multiple profiles match:", rows);
    process.exit(1);
  }

  const { data: authData, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });
  if (listError) throw listError;

  const needle = fullName.toLowerCase();
  const authUser = authData.users.find(
    (u) =>
      u.user_metadata?.full_name?.toLowerCase() === needle ||
      u.email?.toLowerCase().includes(needle.replace(/\s+/g, ""))
  );

  if (!authUser) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", authUser.id)
    .maybeSingle();

  return profile;
}

async function main() {
  const fullName = process.argv[2];
  const imageArg = process.argv[3];

  if (!fullName || !imageArg) {
    console.error('Usage: node scripts/set-profile-avatar.mjs "Full Name" path/to/image.png');
    process.exit(1);
  }

  const imagePath = resolve(imageArg);
  if (!existsSync(imagePath)) {
    console.error("Image not found:", imagePath);
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const profile = await findProfile(admin, fullName);
  if (!profile) {
    console.error(`No profile found for "${fullName}"`);
    process.exit(1);
  }

  console.log("Found profile:", profile);

  const buffer = readFileSync(imagePath);
  const ext = imagePath.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const storagePath = `${profile.id}/avatar.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(storagePath, buffer, { upsert: true, contentType });

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    process.exit(1);
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(storagePath);

  const { data: updated, error: updateError } = await admin
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", profile.id)
    .select("id, full_name, avatar_url")
    .single();

  if (updateError) {
    console.error("Profile update failed:", updateError.message);
    process.exit(1);
  }

  if (profile.role === "coach") {
    await admin
      .from("coach_profiles")
      .update({ logo_url: publicUrl })
      .eq("user_id", profile.id);
  }

  console.log("Avatar updated:", updated);
  console.log("Public URL:", publicUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
