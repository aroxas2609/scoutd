import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo review (dev)",
  robots: { index: false, follow: false },
};

export default function LogoReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0b1020] text-white antialiased">{children}</div>
  );
}
