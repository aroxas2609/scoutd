"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { resolveAppUrl } from "@/lib/auth/resolve-app-url";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";
import type { UserRole } from "@/types/database";

const MIN_PASSWORD_LENGTH = 8;

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function signUp(formData: FormData) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  ) {
    return {
      error:
        "Supabase is not configured. Save real keys in .env.local and restart the dev server (npm run dev).",
    };
  }

  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error: error.message };

    // Email confirmation enabled: no session until user confirms
    if (data.user && !data.session) {
      return {
        error:
          "Check your email to confirm your account, then sign in. Or disable Confirm email in Supabase → Authentication → Providers → Email.",
      };
    }
  } catch {
    return {
      error:
        "Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and your internet connection, then restart npm run dev.",
    };
  }

  redirect("/role");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete")
        .eq("id", user.id)
        .single();

      redirect(getPostLoginRedirect(profile));
    }
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return {
      error:
        "Could not reach Supabase. Check .env.local and restart npm run dev.",
    };
  }

  redirect("/search");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function removeUserAvatarStorage(
  admin: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
) {
  const { data: files } = await admin.storage.from("avatars").list(userId);
  if (!files?.length) return;

  const paths = files.map((file) => `${userId}/${file.name}`);
  await admin.storage.from("avatars").remove(paths);
}

/** Permanently deletes the signed-in user from Auth and all related DB rows. */
export async function deleteAccount(): Promise<{ error?: string; success?: true }> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.includes("placeholder")) {
    return {
      error:
        "Account deletion is not available. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to delete your account" };

  const admin = await createServiceClient();

  await admin
    .from("verification_requests")
    .update({ reviewed_by: null })
    .eq("reviewed_by", user.id);

  await admin.from("featured_entities").delete().eq("entity_id", user.id);

  try {
    await removeUserAvatarStorage(admin, user.id);
  } catch {
    // Storage cleanup is best-effort; auth delete still proceeds
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return { error: deleteError.message };

  await supabase.auth.signOut();
  return { success: true };
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Enter your email address" };

  const supabase = await createClient();
  const appUrl = await resolveAppUrl();
  const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent("/update-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { error: error.message };

  return {
    success: true as const,
    message: "If an account exists for that email, we sent a password reset link.",
  };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to change your password" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: true as const };
}

export async function setUserRole(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  redirect(role === "coach" ? "/onboarding/coach" : "/onboarding/player");
}
