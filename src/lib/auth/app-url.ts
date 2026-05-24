export function isLocalHost(host: string) {
  return (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("127.0.0.1:")
  );
}

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function urlFromEnvIfPublic(): string | null {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!env) return null;
  try {
    if (!isLocalHost(new URL(env).host)) {
      return normalizeUrl(env);
    }
  } catch {
    // invalid URL in env
  }
  return null;
}

function urlFromVercel(): string | null {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return normalizeUrl(`https://${production}`);

  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return normalizeUrl(`https://${preview}`);

  return null;
}

/** Build origin from request host headers (non-local only). */
export function appUrlFromHost(host: string, proto?: string | null): string | null {
  if (!host || isLocalHost(host)) return null;
  const scheme =
    proto?.split(",")[0]?.trim() ?? (host.includes("localhost") ? "http" : "https");
  return normalizeUrl(`${scheme}://${host}`);
}

/**
 * Public app URL for auth emails and callbacks.
 * On Vercel, prefers deployment URL over NEXT_PUBLIC_APP_URL when env still points at localhost.
 */
export function getAppUrl() {
  return urlFromEnvIfPublic() ?? urlFromVercel() ?? "http://localhost:3000";
}
