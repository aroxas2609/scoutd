"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";
import type { UserRole } from "@/types/database";

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
  const fullName = formData.get("fullName") as string;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
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

  redirect("/discover");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
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
