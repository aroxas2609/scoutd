"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, MessageCircle, Search } from "lucide-react";
import { PremiumButton } from "@/components/ui/premium-button";

const highlights = [
  {
    icon: Search,
    title: "Find players nearby",
    desc: "Search and discover talent in your area.",
  },
  {
    icon: MessageCircle,
    title: "Message securely",
    desc: "Chat with players, parents, and coaches.",
  },
  {
    icon: Calendar,
    title: "Organise trials",
    desc: "Send invites with date, time, and location.",
  },
];

export function WelcomeScreen() {
  return (
    <div className="mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden bg-[var(--bg-deep)] text-foreground">
      <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="text-lg font-semibold tracking-tight">Scoutd</span>
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-y-none px-5 py-1">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--accent-brand)]" />
          Local clubs & community football
        </div>

        <h1 className="mt-5 text-[2rem] font-semibold leading-[1.15] tracking-tight">
          Find players for{" "}
          <span className="text-[var(--accent-brand)]">your club</span>
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Discover players nearby, stay in touch, and arrange trials — built for
          grassroots clubs, not big agencies.
        </p>

        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[var(--bg-surface)] px-3.5 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <Icon className="h-4 w-4 text-[var(--accent-brand)]" />
              </span>
              <span className="min-w-0 pt-0.5">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs leading-snug text-muted-foreground">{desc}</p>
              </span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="shrink-0 space-y-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <Link href="/signup" className="block">
          <PremiumButton size="lg" className="h-12 w-full gap-2 text-base">
            Get started
            <ArrowRight className="h-4 w-4" />
          </PremiumButton>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Already on Scoutd?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </footer>
    </div>
  );
}
