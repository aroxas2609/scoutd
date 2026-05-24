/** Safe in-app path for profile back navigation (query param). */
export function sanitizeReturnPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  return path;
}

export function profileUrl(basePath: string, returnTo?: string | null) {
  const safe = sanitizeReturnPath(returnTo);
  if (!safe) return basePath;
  return `${basePath}?returnTo=${encodeURIComponent(safe)}`;
}

export function readReturnToFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return sanitizeReturnPath(params.get("returnTo"));
}
