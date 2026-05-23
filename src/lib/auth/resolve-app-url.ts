import { headers } from "next/headers";
import { getAppUrl } from "@/lib/auth/app-url";

function isLocalHost(host: string) {
  return host === "localhost" || host.startsWith("localhost:") || host.startsWith("127.0.0.1");
}

/**
 * Prefer the URL the user is actually on (fixes reset emails when env still points at localhost).
 */
export async function resolveAppUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && !isLocalHost(host)) {
      const proto =
        h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() unavailable outside a request
  }

  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) {
    try {
      if (!isLocalHost(new URL(env).host)) {
        return env.replace(/\/$/, "");
      }
    } catch {
      // invalid URL in env
    }
  }

  return getAppUrl();
}
