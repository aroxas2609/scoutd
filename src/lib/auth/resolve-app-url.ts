import { headers } from "next/headers";
import { appUrlFromHost, getAppUrl } from "@/lib/auth/app-url";

/**
 * Prefer the URL the user is actually on, then a public env/deployment URL.
 * Avoids password-reset links pointing at localhost when prod env was copied from .env.example.
 */
export async function resolveAppUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto");
    const fromRequest = host ? appUrlFromHost(host, proto) : null;
    if (fromRequest) return fromRequest;
  } catch {
    // headers() unavailable outside a request
  }

  return getAppUrl();
}
