export type SetupProfile = {
  role: string | null;
  onboarding_complete: boolean;
} | null;

/** Account exists but user has not finished signup → role → onboarding. */
export function isIncompleteSetup(profile: SetupProfile): boolean {
  return !!profile && !profile.onboarding_complete;
}

const SETUP_PATH_PREFIXES = ["/signup", "/role", "/onboarding", "/login", "/forgot-password", "/update-password"];

export function isSetupFlowPath(path: string): boolean {
  return SETUP_PATH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
