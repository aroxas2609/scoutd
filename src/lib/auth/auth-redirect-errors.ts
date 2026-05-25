/** Parse Supabase auth errors from query string and URL hash (recovery / OAuth redirects). */
export function getAuthRedirectError(
  searchParams: URLSearchParams,
  hash = ""
): { message: string; code: string | null } | null {
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const errorCode =
    searchParams.get("error_code") ?? hashParams.get("error_code") ?? null;
  const accessDenied =
    searchParams.get("error") === "access_denied" ||
    hashParams.get("error") === "access_denied";

  if (!errorCode && !accessDenied) return null;

  const rawDescription =
    searchParams.get("error_description") ?? hashParams.get("error_description");
  const decoded = rawDescription
    ? decodeURIComponent(rawDescription.replace(/\+/g, " "))
    : null;

  if (errorCode === "otp_expired") {
    return {
      code: errorCode,
      message:
        "This Scoutd reset link has expired or was already used. Request a new link, then open it once in the same browser where you submitted the forgot-password form. Some email apps preview links automatically—if that happens, request another link and click it immediately.",
    };
  }

  return {
    code: errorCode,
    message:
      decoded ??
      (errorCode
        ? `Sign-in link error (${errorCode}). Request a new password reset.`
        : "We could not verify this link. Request a new password reset."),
  };
}

export function hasAuthRedirectError(
  searchParams: URLSearchParams,
  hash = ""
): boolean {
  return getAuthRedirectError(searchParams, hash) !== null;
}
