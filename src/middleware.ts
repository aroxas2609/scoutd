import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getPostLoginRedirect, getSetupRedirectPath, shouldRedirect } from "@/lib/auth/redirect-path";

const protectedPrefixes = [
  "/discover",
  "/search",
  "/messages",
  "/trials",
  "/profile",
  "/notifications",
  "/shortlist",
  "/onboarding",
];
const authRoutes = ["/login", "/signup", "/role", "/forgot-password", "/update-password"];
const adminPrefix = "/admin";

export async function middleware(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { user, supabaseResponse, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  const isAuthRoute = authRoutes.some((p) => path.startsWith(p));
  const isAdmin = path.startsWith(adminPrefix);
  const isOnboarding = path.startsWith("/onboarding");

  if (!user && (isProtected || isOnboarding || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  let profile: { role: string | null; onboarding_complete: boolean } | null = null;

  if (user) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role, onboarding_complete")
      .eq("id", user.id)
      .single();

    profile = profileRow;

    const setupTarget = getSetupRedirectPath(profile);

    if (isAuthRoute) {
      if (path === "/role" && setupTarget === "/role") {
        return supabaseResponse;
      }
      if (path === "/update-password" || path === "/forgot-password") {
        return supabaseResponse;
      }
      const authTarget = getPostLoginRedirect(profile);
      if (shouldRedirect(path, authTarget)) {
        const url = request.nextUrl.clone();
        url.pathname = authTarget;
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    if (isProtected && setupTarget && shouldRedirect(path, setupTarget)) {
      const url = request.nextUrl.clone();
      url.pathname = setupTarget;
      return NextResponse.redirect(url);
    }

    if (profile?.role === "player" && path.startsWith("/shortlist")) {
      const url = request.nextUrl.clone();
      url.pathname = "/search";
      return NextResponse.redirect(url);
    }
  }

  if (isAdmin && user) {
    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/search";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|splash|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
