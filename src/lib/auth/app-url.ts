function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

/** Public app URL (inlined at build from NEXT_PUBLIC_APP_URL). Safe for client + server. */
export function getAppUrl() {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return normalizeUrl(env);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return normalizeUrl(`https://${vercelProduction}`);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeUrl(`https://${vercelUrl}`);

  return "http://localhost:3000";
}
