import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Scoutd — Find players for your club",
  description:
    "Recruitment tools for local and grassroots football clubs. Discover players nearby, message securely, and organise trials.",
  openGraph: {
    title: "Scoutd — Find players for your club",
    description: "Built for local clubs and community football.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--bg-deep)]">
      {children}
    </div>
  );
}
