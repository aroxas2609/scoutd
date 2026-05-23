/** Rethrow in client handlers so Next.js can complete a server-action redirect. */
export function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}
