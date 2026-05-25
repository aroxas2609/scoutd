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

/** Server-only production URL (set in Vercel; not inlined into the client bundle). */
function urlFromServerEnv(): string | null {
  const app = process.env.APP_URL?.trim();
  if (!app) return null;
  try {
    if (!isLocalHost(new URL(app).host)) {
      return normalizeUrl(app);
    }
  } catch {
    // invalid URL
  }
  return null;
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
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
  return (
    urlFromServerEnv() ??
    urlFromEnvIfPublic() ??
    urlFromVercel() ??
    "http://localhost:3000"
  );
}

/** Must match Supabase recovery email template (token_hash link). Works from PWA, Safari, or Chrome. */
export function passwordResetRedirectUrl(appOrigin: string) {
  return `${appOrigin}/update-password`;
}

/** Password-reset and other auth emails — never use localhost on Vercel. */
export function getAppUrlForAuth() {
  const base = getAppUrl();
  if (isVercelRuntime()) {
    try {
      if (isLocalHost(new URL(base).host)) {
        const deployment = urlFromServerEnv() ?? urlFromVercel();
        if (deployment) return deployment;
      }
    } catch {
      // fall through
    }
  }
  return base;
}
