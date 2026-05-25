import { headers } from "next/headers";
import { appUrlFromHost, getAppUrlForAuth, isLocalHost } from "@/lib/auth/app-url";

/**
 * Prefer the URL the user is actually on, then a public env/deployment URL.
 * On Vercel, never returns localhost (auth emails must use production origin).
 */
export async function resolveAppUrl(): Promise<string> {
  const fallback = getAppUrlForAuth();

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto");
    const fromRequest = host ? appUrlFromHost(host, proto) : null;
    if (fromRequest) {
      if (process.env.VERCEL && isLocalHost(new URL(fromRequest).host)) {
        return fallback;
      }
      return fromRequest;
    }
  } catch {
    // headers() unavailable outside a request
  }

  return fallback;
}

/** PKCE reset must be started in the browser; callback exchanges ?code= then sends user to /update-password. */
export function passwordResetRedirectUrl(appOrigin: string) {
  return `${appOrigin}/auth/callback?type=recovery`;
}
