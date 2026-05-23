type ProfileGate = {
  role: string | null;
  onboarding_complete: boolean;
} | null;

/** Redirect only when setup is incomplete. Returns null when user can use the app freely. */
export function getSetupRedirectPath(profile: ProfileGate): string | null {
  if (!profile?.role) return "/role";
  if (!profile.onboarding_complete) {
    return profile.role === "coach" ? "/onboarding/coach" : "/onboarding/player";
  }
  return null;
}

/** After login/signup or when visiting auth pages while already signed in. */
export function getPostLoginRedirect(profile: ProfileGate): string {
  return getSetupRedirectPath(profile) ?? "/search";
}

export function shouldRedirect(path: string, target: string): boolean {
  if (path === target) return false;
  if (target.startsWith("/onboarding") && path.startsWith("/onboarding")) {
    return false;
  }
  return true;
}
